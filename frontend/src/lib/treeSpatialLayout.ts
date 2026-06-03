import { Edge, Node } from "@xyflow/react";
import { Question } from "@/types/question";

/**
 * Type des nœuds dans l'arborescence: racine virtuelle, thème, question ou réponse
 */
type TreeNodeKind = "theme" | "question" | "response";

/**
 * Données d'une réponse de projet associée à une question
 */
type ProjectResponse = {
  responseId?: number;
  questionId: number;
  label: string | null;
  keyword?: string | null;
};

/**
 * Données enrichies d'un nœud du graphe ReactFlow
 */
type FlowNodeData = Question & {
  nodeKind?: TreeNodeKind;
  parentNodeId?: string | null;
  themeKey?: string;
  depth?: number;
  isVirtualRoot?: boolean;
  responseId?: number;
  isCollapsed?: boolean;
  side?: "left" | "right" | "root";
  status?: "pending" | "answered" | "skipped";
  isCollapsible?: boolean;
};

/**
 * Paramètres d'entrée pour calculer le layout spatial du graphe
 */
type BuildTreeLayoutParams = {
  initialNodes: Node[];
  initialEdges: Edge[];
  projectResponses: ProjectResponse[];
  revealByResponses: boolean;
  collapsedNodeIds: Set<string>;
};

/**
 * Configuration de l'espacement et dimensions des nœuds
 * Basée sur l'algorithme MindMap pour éviter les chevauchements
 */
const LAYOUT_CONFIG = {
  NODE_W: 120,      // largeur d'un nœud (pixels)
  NODE_H: 40,       // hauteur d'un nœud (pixels)
  H_GAP: 100,       // espace horizontal entre parent et enfants
  V_GAP: 50,        // espace vertical entre enfants frères
} as const;

/**
 * Calcule le layout spatial final du graphe affiché dans ReactFlow.
 * 
 * Étapes du traitement:
 * 1. Visibilité : détermine quels nœuds (thèmes/questions) doivent être visibles
 * 2. Positionnement : applique un algorithme inspiré de MindMap pour placer les nœuds hiérarchiquement
 * 3. Réponses : positionne les nœuds de réponse à côté de leurs questions parentes (si reveal actif)
 * 
 * @param initialNodes - nœuds du graphe sans layout ni visibilité appliqués
 * @param initialEdges - arêtes du graphe
 * @param projectResponses - réponses du projet associées aux questions
 * @param revealByResponses - si true, ne montre que les branches avec réponses
 * @param collapsedNodeIds - ensemble des nœuds actuellement repliés
 * @returns objet { nodes, edges } avec layout/visibilité appliqués
 */
export function buildTreeSpatialLayout({
  initialNodes,
  initialEdges,
  projectResponses,
  revealByResponses,
  collapsedNodeIds,
}: BuildTreeLayoutParams): { nodes: Node[]; edges: Edge[] } {
  // ─────────────────────────────────────────────────────────────────────────
  // INITIALISATION: Constantes et structures de données
  // ─────────────────────────────────────────────────────────────────────────

  // Configuration du placement des réponses
  const RESPONSE_OFFSET_X = 230;        // décalage horizontal des réponses
  const RESPONSE_OFFSET_Y = 30;         // décalage vertical des réponses
  const RESPONSE_VERTICAL_GAP = 70;     // espacement vertical entre réponses soeurs
  const COLLISION_X_THRESHOLD = 160;    // seuil de collision horizontal
  const COLLISION_Y_THRESHOLD = 55;     // seuil de collision vertical

  // ─ Copies défensives des données d'entrée
  const baseNodes = initialNodes.map((node) => ({
    ...node,
    data: { ...(node.data as any) },
  }));
  const baseEdges = [...initialEdges];

  // ─ Structures de travail pour la construction du graphe
  const responseMap = new Map<number, ProjectResponse>();
  const childrenMap = new Map<string, string[]>();
  const subtreeHeightMap = new Map<string, number>();
  const visibilityMap = new Map<string, boolean>();
  const nodeKindById = new Map<string, TreeNodeKind>();
  const questionNodesByQuestionId = new Map<number, Node>();
  const parentNodeIdsWithChildren = new Set<string>();

  // ─ Index des réponses par questionId pour accès rapide
  projectResponses.forEach((response) => {
    responseMap.set(Number(response.questionId), response);
  });

  // ─ Construction de la map des relations parent-enfants à partir des arêtes
  baseEdges.forEach((edge) => {
    const siblings = childrenMap.get(edge.source) || [];
    siblings.push(edge.target);
    childrenMap.set(edge.source, siblings);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITAIRES: Calcul de hauteur et layout hiérarchique
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calcule récursivement l'espace vertical total occupé par un sous-arbre.
   * 
   * Principe post-order:
   * - Une feuille occupe NODE_H
   * - Un nœud interne occupe: somme(hauteur enfants) + espaces entre enfants
   * 
   * Résultat mis en cache pour éviter les recalculs.
   */
  const calcSubtreeHeight = (nodeId: string): number => {
    if (subtreeHeightMap.has(nodeId)) {
      return subtreeHeightMap.get(nodeId)!;
    }

    // Filtre les enfants visibles
    const visibleChildren = (childrenMap.get(nodeId) || []).filter((childId) => {
      const childNode = baseNodes.find((n) => n.id === childId);
      return childNode && !childNode.hidden;
    });

    let calculatedHeight: number;
    if (visibleChildren.length === 0) {
      // Feuille: hauteur minimale
      calculatedHeight = LAYOUT_CONFIG.NODE_H;
    } else {
      // Nœud interne: somme des hauteurs + espacements
      const totalChildrenHeight =
        visibleChildren.reduce((sum, childId) => sum + calcSubtreeHeight(childId), 0) +
        LAYOUT_CONFIG.V_GAP * (visibleChildren.length - 1);
      calculatedHeight = Math.max(LAYOUT_CONFIG.NODE_H, totalChildrenHeight);
    }

    subtreeHeightMap.set(nodeId, calculatedHeight);
    return calculatedHeight;
  };

  /**
   * Place récursivement tous les nœuds d'un sous-arbre dans le plan.
   * 
   * Stratégie:
   * - Centre verticalement le nœud courant dans la zone qui lui est allouée
   * - Attribue à chaque enfant une tranche verticale consécutive
   * - Appelle récursivement pour tous les enfants
   * 
   * @param nodeId - identifiant du nœud à placer
   * @param xCoord - coordonnée X (même pour tous les nœuds du niveau)
   * @param topY - limite haute de la zone allouée
   * @param branchSide - "left", "right" ou "root" pour l'information de direction
   */
  const layoutSubtree = (nodeId: string, xCoord: number, topY: number, branchSide: "left" | "right" | "root") => {
    const node = baseNodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nodeData = node.data as FlowNodeData;
    const allocatedHeight = calcSubtreeHeight(nodeId);

    // Centre le nœud verticalement dans sa zone
    node.position = {
      x: xCoord,
      y: topY + allocatedHeight / 2 - LAYOUT_CONFIG.NODE_H / 2,
    };

    // Attache l'information de direction (utilisée pour les couleurs, etc.)
    nodeData.side = branchSide;

    // Traite les enfants visibles
    const visibleChildren = (childrenMap.get(nodeId) || []).filter((childId) => {
      const childNode = baseNodes.find((n) => n.id === childId);
      return childNode && !childNode.hidden;
    });

    if (visibleChildren.length === 0) return;

    // Calcule la position X des enfants (avance vers la droite ou recule vers la gauche)
    const childXCoord =
      branchSide === "right"
        ? xCoord + LAYOUT_CONFIG.NODE_W + LAYOUT_CONFIG.H_GAP
        : xCoord - LAYOUT_CONFIG.H_GAP - LAYOUT_CONFIG.NODE_W;

    // Place les enfants les uns après les autres verticalement
    let currentY = topY;
    visibleChildren.forEach((childId) => {
      const childHeight = calcSubtreeHeight(childId);
      layoutSubtree(childId, childXCoord, currentY, branchSide);
      currentY += childHeight + LAYOUT_CONFIG.V_GAP;
    });
  };

  /**
   * Orchestre le layout global de l'arborescence.
   * 
   * Stratégie MindMap:
   * - Place la racine au centre
   * - Alterne les enfants: droite (indices pairs), gauche (indices impairs)
   * - Centre verticalement chaque groupe par rapport à la racine
   */
  const computeTreeLayout = (rootNodeId: string, centerX: number, centerY: number) => {
    const rootNode = baseNodes.find((n) => n.id === rootNodeId);
    if (!rootNode) return;

    // Place la racine virtuelle au centre
    rootNode.position = {
      x: centerX - LAYOUT_CONFIG.NODE_W / 2,
      y: centerY - LAYOUT_CONFIG.NODE_H / 2,
    };
    (rootNode.data as FlowNodeData).side = "root";

    // Récupère les enfants visibles de la racine
    const rootChildren = (childrenMap.get(rootNodeId) || []).filter((childId) => {
      const childNode = baseNodes.find((n) => n.id === childId);
      return childNode && !childNode.hidden;
    });

    // Répartit les enfants alternativement
    const rightBranchChildren = rootChildren.filter((_, index) => index % 2 === 0);
    const leftBranchChildren = rootChildren.filter((_, index) => index % 2 === 1);

    // ── Placement du côté DROIT ──────────────────────────────────────────
    const rightBranchTotalHeight =
      rightBranchChildren.reduce((sum, childId) => sum + calcSubtreeHeight(childId), 0) +
      LAYOUT_CONFIG.V_GAP * Math.max(0, rightBranchChildren.length - 1);

    let rightBranchTopY = centerY - rightBranchTotalHeight / 2;
    rightBranchChildren.forEach((childId) => {
      const childHeight = calcSubtreeHeight(childId);
      const childXCoord = centerX + LAYOUT_CONFIG.NODE_W / 2 + LAYOUT_CONFIG.H_GAP;
      layoutSubtree(childId, childXCoord, rightBranchTopY, "right");
      rightBranchTopY += childHeight + LAYOUT_CONFIG.V_GAP;
    });

    // ── Placement du côté GAUCHE ─────────────────────────────────────────
    const leftBranchTotalHeight =
      leftBranchChildren.reduce((sum, childId) => sum + calcSubtreeHeight(childId), 0) +
      LAYOUT_CONFIG.V_GAP * Math.max(0, leftBranchChildren.length - 1);

    let leftBranchTopY = centerY - leftBranchTotalHeight / 2;
    leftBranchChildren.forEach((childId) => {
      const childHeight = calcSubtreeHeight(childId);
      const childXCoord = centerX - LAYOUT_CONFIG.NODE_W / 2 - LAYOUT_CONFIG.H_GAP - LAYOUT_CONFIG.NODE_W;
      layoutSubtree(childId, childXCoord, leftBranchTopY, "left");
      leftBranchTopY += childHeight + LAYOUT_CONFIG.V_GAP;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ÉTAPE 1: Calcul de la visibilité des nœuds
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Vérifie récursivement si un nœud ou ses descendants ont au moins une réponse.
   * Utilisé pour filtrer les branches sans données en mode "revealByResponses".
   */
  const hasResponseInSubtree = (nodeId: string): boolean => {
    const node = baseNodes.find((n) => n.id === nodeId);
    if (!node) return false;
    
    const nodeData = node.data as FlowNodeData;
    
    // Vérifie la réponse du nœud courant s'il s'agit d'une question
    const isQuestion = nodeData.nodeKind === "question";
    const isThemeWithQuestion = 
      nodeData.nodeKind === "theme" && 
      nodeData.questionId !== undefined && 
      nodeData.questionId !== null;
    
    if (isQuestion || isThemeWithQuestion) {
      const questionId = Number(nodeData.questionId || nodeData.id);
      if (responseMap.has(questionId)) return true;
    }
    
    // Vérifie récursivement dans les descendants
    const descendants = childrenMap.get(nodeId) || [];
    return descendants.some((childId) => hasResponseInSubtree(childId));
  };

  // ─ Pré-indexation des métadonnées pour accès rapide
  baseNodes.forEach((node) => {
    const nodeData = node.data as FlowNodeData;
    if (nodeData.nodeKind) {
      nodeKindById.set(node.id, nodeData.nodeKind);
    }
    if (nodeData.parentNodeId) {
      parentNodeIdsWithChildren.add(nodeData.parentNodeId);
    }
  });

  // ─ Traitement de la visibilité: thèmes
  baseNodes.forEach((node) => {
    const nodeData = node.data as FlowNodeData;

    // La racine virtuelle est toujours visible (point de transformation du graphe)
    if (nodeData.isVirtualRoot) {
      node.hidden = false;
      visibilityMap.set(node.id, true);
      return;
    }

    // Calcul de visibilité des thèmes
    if (nodeData.nodeKind === "theme") {
      const parentNodeId = nodeData.parentNodeId || null;
      const isParentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
      const isParentTheme = parentNodeId ? nodeKindById.get(parentNodeId) === "theme" : false;
      const isParentThemeCollapsed = isParentTheme && parentNodeId ? collapsedNodeIds.has(parentNodeId) : false;
      const hasResponse = hasResponseInSubtree(node.id);
      const isCollapsed = collapsedNodeIds.has(node.id);

      // Un thème est visible si:
      // - son parent est visible ET
      // - son parent n'est pas replié ET
      // - (mode normal OU le sous-arbre contient une réponse)
      const isVisible = isParentVisible && !isParentThemeCollapsed && (!revealByResponses || hasResponse);

      node.hidden = !isVisible;
      nodeData.isCollapsed = isCollapsed;
      visibilityMap.set(node.id, isVisible);
    }
  });

  // ─ Traitement de la visibilité: questions
  // Les questions sont triées par profondeur pour garantir que la visibilité
  // d'un parent est déjà connue quand on évalue celle de ses enfants
  const questionNodes = baseNodes
    .filter((node) => {
      const nodeData = node.data as FlowNodeData;
      const isQuestionNode = nodeData.nodeKind === "question";
      const isThemeWithQuestion = 
        nodeData.nodeKind === "theme" && 
        nodeData.questionId !== undefined && 
        nodeData.questionId !== null;
      return (isQuestionNode || isThemeWithQuestion) && !nodeData.isVirtualRoot;
    })
    .sort(
      (a, b) =>
        Number((a.data as FlowNodeData).depth || 0) -
        Number((b.data as FlowNodeData).depth || 0)
    );

  questionNodes.forEach((node) => {
    const nodeData = node.data as FlowNodeData;
    const questionId = Number(nodeData.questionId || node.id);
    const parentNodeId = nodeData.parentNodeId || null;
    const isParentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
    const isParentQuestion = parentNodeId ? nodeKindById.get(parentNodeId) === "question" : false;
    const isParentTheme = parentNodeId ? nodeKindById.get(parentNodeId) === "theme" : false;
    const isParentThemeCollapsed = isParentTheme && parentNodeId ? collapsedNodeIds.has(parentNodeId) : false;
    const isParentQuestionCollapsed = isParentQuestion && parentNodeId ? collapsedNodeIds.has(parentNodeId) : false;
    
    const themeNodeId = nodeData.themeKey ? `theme-${nodeData.themeKey}` : null;
    const isThemeCollapsed = themeNodeId ? collapsedNodeIds.has(themeNodeId) : false;
    const isCollapsed = collapsedNodeIds.has(node.id);
    const isCollapsible = parentNodeIdsWithChildren.has(node.id);

    const hasSubtreeResponse = hasResponseInSubtree(node.id);

    // Une question est visible si:
    // - aucun ancêtre n'est replié ET
    // - le parent est visible ET
    // - (mode normal OU le sous-arbre contient une réponse)
    const isVisible =
      !isParentThemeCollapsed &&
      !isParentQuestionCollapsed &&
      !isThemeCollapsed &&
      isParentVisible &&
      (!revealByResponses || hasSubtreeResponse);

    // Détermine le statut basé sur la réponse du projet
    const responseData = responseMap.get(questionId);
    const hasResponse = Boolean(responseData);
    const isSkipped = responseData?.label == null;
    const status = hasResponse ? (isSkipped ? "skipped" : "answered") : "pending";

    node.hidden = !isVisible;
    nodeData.status = status;
    nodeData.keyword = nodeData.keyword;
    nodeData.isCollapsed = isCollapsed;
    nodeData.isCollapsible = isCollapsible;

    visibilityMap.set(node.id, isVisible);
    questionNodesByQuestionId.set(questionId, node);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ÉTAPE 2: Positionnement spatial hiérarchique
  // ─────────────────────────────────────────────────────────────────────────

  const virtualRoot = baseNodes.find((node) => {
    const nodeData = node.data as FlowNodeData;
    return nodeData.isVirtualRoot;
  });

  if (virtualRoot) {
    // Applique l'algorithme de layout MindMap à partir de la racine virtuelle
    computeTreeLayout(virtualRoot.id, 0, 0);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ÉTAPE 3: Placement des nœuds de réponse (si mode reveal actif)
  // ─────────────────────────────────────────────────────────────────────────

  if (revealByResponses) {
    /**
     * Structure temporaire pour organiser le placement d'une réponse
     */
    type PendingResponsePlacement = {
      response: ProjectResponse;
      questionNode: Node;
      responseDirection: -1 | 1;
      responseX: number;
      preferredY: number;
    };

    // ─ Préparation: comptage des réponses par question
    const responseCountByQuestionId = new Map<number, number>();
    projectResponses.forEach((response) => {
      if (response.label == null || String(response.label).trim() === "") {
        return;
      }
      const questionId = Number(response.questionId);
      responseCountByQuestionId.set(
        questionId,
        (responseCountByQuestionId.get(questionId) || 0) + 1
      );
    });

    // ─ Préparation: calcul des positions préférées pour chaque réponse
    const leftResponsePlacements: PendingResponsePlacement[] = [];
    const rightResponsePlacements: PendingResponsePlacement[] = [];

    projectResponses.forEach((response) => {
      if (response.label == null || String(response.label).trim() === "") {
        return;
      }

      const questionNode = questionNodesByQuestionId.get(Number(response.questionId));
      if (!questionNode) {
        return;
      }

      // La direction dépend du côté du parent
      const responseDirection: -1 | 1 = questionNode.position.x < 0 ? -1 : 1;
      const responseX = questionNode.position.x + RESPONSE_OFFSET_X * responseDirection;
      const preferredY = questionNode.position.y + RESPONSE_OFFSET_Y;

      const placement: PendingResponsePlacement = {
        response,
        questionNode,
        responseDirection,
        responseX,
        preferredY,
      };

      if (responseDirection < 0) {
        leftResponsePlacements.push(placement);
      } else {
        rightResponsePlacements.push(placement);
      }
    });

    /**
     * Place les réponses d'un côté du graphe en gérant les collisions.
     * 
     * Stratégie:
     * - Regroupe les réponses par question (soeurs)
     * - Pour chaque groupe, place les réponses autour de l'axe vertical du parent
     * - En cas de collision avec un groupe précédent, décale le groupe entier
     */
    const placeResponsesOnSide = (placements: PendingResponsePlacement[]) => {
      // Positions occupées (utilisées pour détecter les collisions)
      const occupiedPositions: Array<{ x: number; y: number }> = [];

      /**
       * Vérifie s'il y a une collision avoisinante à la position donnée
       */
      const hasCollision = (xPos: number, yPos: number): boolean => {
        return occupiedPositions.some(
          (position) =>
            Math.abs(position.x - xPos) < COLLISION_X_THRESHOLD &&
            Math.abs(position.y - yPos) < COLLISION_Y_THRESHOLD
        );
      };

      /**
       * Calcule les décalages verticaux pour distribuer des réponses soeurs
       * autour de l'axe vertical du parent (en S symétrique)
       */
      const getCenteredVerticalOffsets = (count: number): number[] => {
        const middleIndex = (count - 1) / 2;
        return Array.from({ length: count }, (_, index) =>
          (index - middleIndex) * RESPONSE_VERTICAL_GAP
        );
      };

      /**
       * Cherche un décalage vertical global qui évite les collisions
       * en testant d'abord pas de décalage, puis +offset, -offset, etc.
       */
      const findNonCollidingGroupShift = (xPos: number, baseYPositions: number[]): number => {
        const maxTestSteps = 100;
        for (let step = 0; step <= maxTestSteps; step += 1) {
          // Teste d'abord pas de décalage, puis positif et négatif alternativement
          const deltas = step === 0 ? [0] : [step * RESPONSE_VERTICAL_GAP, -step * RESPONSE_VERTICAL_GAP];

          for (const delta of deltas) {
            const canPlaceGroup = baseYPositions.every((y) => !hasCollision(xPos, y + delta));
            if (canPlaceGroup) {
              return delta;
            }
          }
        }
        return 0;
      };

      // ─ Regroupement des réponses soeurs
      const groupedByParent = new Map<string, PendingResponsePlacement[]>();

      placements.forEach((placement) => {
        const groupKey = placement.questionNode.id;
        const group = groupedByParent.get(groupKey);
        if (group) {
          group.push(placement);
        } else {
          groupedByParent.set(groupKey, [placement]);
        }
      });

      // ─ Placement des groupes dans l'ordre top-to-bottom
      const sortedGroups = Array.from(groupedByParent.values()).sort(
        (groupA, groupB) => groupA[0].preferredY - groupB[0].preferredY
      );

      sortedGroups.forEach((group) => {
        // Tri stable au sein d'un groupe (par responseId et label)
        const sortedGroup = [...group].sort((a, b) => {
          const idA = Number(a.response.responseId ?? 0);
          const idB = Number(b.response.responseId ?? 0);
          if (idA !== idB) {
            return idA - idB;
          }
          return String(a.response.label ?? "").localeCompare(String(b.response.label ?? ""));
        });

        // Calcule les positions idéales autour du parent
        const groupXPos = sortedGroup[0].responseX;
        const groupPreferredY = sortedGroup[0].preferredY;
        const verticalOffsets = getCenteredVerticalOffsets(sortedGroup.length);
        const idealYPositions = verticalOffsets.map((offset) => groupPreferredY + offset);

        // Cherche un décalage pour éviter les collisions
        const groupShift = findNonCollidingGroupShift(groupXPos, idealYPositions);

        // Place chaque réponse du groupe
        sortedGroup.forEach((placement, indexInGroup) => {
          const responseNodeId = `r-${placement.response.responseId ?? placement.response.questionId}`;
          const finalYPos = idealYPositions[indexInGroup] + groupShift;

          occupiedPositions.push({ x: groupXPos, y: finalYPos });

          const responseNode: Node = {
            id: responseNodeId,
            type: "response",
            position: {
              x: groupXPos,
              y: finalYPos,
            },
            data: {
              nodeKind: "response" as const,
              label: placement.response.label,
              keyword: placement.response.keyword,
              responseId: placement.response.responseId,
              questionId: placement.response.questionId,
              parentNodeId: placement.questionNode.id,
            },
            hidden:
              placement.questionNode.hidden ||
              collapsedNodeIds.has(placement.questionNode.id),
          };

          // Ajoute le nœud et l'arête au graphe
          baseNodes.push(responseNode);
          baseEdges.push({
            id: `e-${placement.questionNode.id}-${responseNodeId}`,
            source: placement.questionNode.id,
            target: responseNodeId,
          });
        });
      });
    };

    // Place les réponses de chaque côté indépendamment
    placeResponsesOnSide(leftResponsePlacements);
    placeResponsesOnSide(rightResponsePlacements);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SORTIE: Retourne le graphe transformé prêt à être rendu
  // ─────────────────────────────────────────────────────────────────────────
  
  return { nodes: baseNodes, edges: baseEdges };
}
