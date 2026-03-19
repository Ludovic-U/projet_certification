import { Edge, Node } from "@xyflow/react";
import { Question } from "@/types/question";

type TreeNodeKind = "theme" | "question" | "response";

type ProjectResponse = {
  responseId?: number;
  questionId: number;
  label: string | null;
  keyword?: string | null;
};

type FlowNodeData = Question & {
  nodeKind?: TreeNodeKind;
  parentNodeId?: string | null;
  themeKey?: string;
  depth?: number;
  isVirtualRoot?: boolean;
  responseId?: number;
  isCollapsed?: boolean;
};

type BuildTreeLayoutParams = {
  initialNodes: Node[];
  initialEdges: Edge[];
  projectResponses: ProjectResponse[];
  revealByResponses: boolean;
  collapsedNodeIds: Set<string>;
};

// Calcule le layout final du graphe affiché dans ReactFlow.
// La fonction applique en une passe:
// 1) la visibilité des nodes (thèmes / questions),
// 2) la réorganisation verticale des questions (reflow),
// 3) le placement des nodes de réponses.
export function buildTreeSpatialLayout({
  initialNodes,
  initialEdges,
  projectResponses,
  revealByResponses,
  collapsedNodeIds,
}: BuildTreeLayoutParams): { nodes: Node[]; edges: Edge[] } {
  // Constantes de layout pour les réponses:
  // - offset horizontal/vertical par rapport à la question parent,
  // - seuils de collision,
  // - écart vertical entre nodes de réponses.
  const RESPONSE_OFFSET_X = 230;
  const RESPONSE_OFFSET_Y = 30;
  const RESPONSE_VERTICAL_GAP = 70;
  const COLLISION_X_THRESHOLD = 160;
  const COLLISION_Y_THRESHOLD = 55;

  // Index des réponses existantes par question (utile pour statut + revealByResponses).
  const responseMap = new Map<number, ProjectResponse>();
  projectResponses.forEach((response) => {
    responseMap.set(Number(response.questionId), response);
  });

  // Copie défensive des nodes/edges d'entrée (on évite de muter les props amont).
  const baseNodes = initialNodes.map((node) => ({ ...node, data: { ...(node.data as any) } }));
  const baseEdges = [...initialEdges];

  // Construction de la map des enfants pour chaque node
  const childrenMap = new Map<string, string[]>();
  baseEdges.forEach((edge) => {
    const list = childrenMap.get(edge.source) || [];
    list.push(edge.target);
    childrenMap.set(edge.source, list);
  });

  // Fonction récursive pour vérifier si un node ou ses descendants ont une réponse
  const hasResponseInSubtree = (nodeId: string): boolean => {
    const node = baseNodes.find((n) => n.id === nodeId);
    if (!node) return false;
    const data = node.data as FlowNodeData;
    // Si c'est une question (ou un thème qui est aussi une question), vérifier sa réponse
    if (data.nodeKind === "question" || (data.nodeKind === "theme" && data.questionId !== undefined && data.questionId !== null)) {
      const qid = Number(data.questionId || data.id);
      if (responseMap.has(qid)) return true;
    }
    // Sinon, vérifier récursivement les enfants
    const children = childrenMap.get(nodeId) || [];
    for (const childId of children) {
      if (hasResponseInSubtree(childId)) return true;
    }
    return false;
  };

  // Structures auxiliaires pour:
  // - connaître la visibilité parent/enfant,
  // - connaître le type d'un node via son id,
  // - retrouver rapidement un node question par questionId.
  const visibilityMap = new Map<string, boolean>();
  const nodeKindById = new Map<string, TreeNodeKind>();
  const questionNodesByQuestionId = new Map<number, Node>();
  const parentNodeIdsWithChildren = new Set<string>();

  baseNodes.forEach((node) => {
    const data = node.data as FlowNodeData;
    if (data.nodeKind) {
      nodeKindById.set(node.id, data.nodeKind);
    }
    if (data.parentNodeId) {
      parentNodeIdsWithChildren.add(data.parentNodeId);
    }
  });

  baseNodes.forEach((node) => {
    const data = node.data as FlowNodeData;

    // La racine virtuelle reste toujours visible (repère du graphe).
    if (data.isVirtualRoot) {
      node.hidden = false;
      visibilityMap.set(node.id, true);
      return;
    }

    // Calcul de visibilité des thèmes:
    // un thème est visible si son parent est visible, non replié, et a des réponses dans le sous-arbre.
    if (data.nodeKind === "theme") {
      const parentNodeId = data.parentNodeId || null;
      const parentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
      const parentIsTheme =
        parentNodeId ? nodeKindById.get(parentNodeId) === "theme" : false;
      const parentThemeCollapsed =
        parentIsTheme && parentNodeId ? collapsedNodeIds.has(parentNodeId) : false;
      const hasResponse = hasResponseInSubtree(node.id);
      const isVisible = parentVisible && !parentThemeCollapsed && (!revealByResponses || hasResponse);
      const isCollapsed = collapsedNodeIds.has(node.id);
      node.hidden = !isVisible;
      // On expose l'état collapsed au composant de node (affichage +/−).
      node.data = { ...data, isCollapsed };
      visibilityMap.set(node.id, isVisible);
    }
  });

  // Les questions sont traitées par profondeur croissante:
  // cela garantit que la visibilité d'un parent est déjà connue
  // quand on évalue la visibilité de ses enfants.
  const questionNodes = baseNodes
    .filter((node) => {
      const data = node.data as FlowNodeData;
      const isQuestionNode = data.nodeKind === "question";
      const isThemeQuestionNode =
        data.nodeKind === "theme" && data.questionId !== undefined && data.questionId !== null;
      return (isQuestionNode || isThemeQuestionNode) && !data.isVirtualRoot;
    })
    .sort(
      (a, b) =>
        Number((a.data as FlowNodeData).depth || 0) -
        Number((b.data as FlowNodeData).depth || 0)
    );

  questionNodes.forEach((node) => {
    const data = node.data as FlowNodeData;
    const questionId = Number(data.questionId || data.id);
    const parentNodeId = data.parentNodeId || null;
    const parentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
    const parentIsQuestion =
      parentNodeId ? nodeKindById.get(parentNodeId) === "question" : false;
    const parentIsTheme =
      parentNodeId ? nodeKindById.get(parentNodeId) === "theme" : false;
    const parentQuestionId = parentIsQuestion
      ? Number(parentNodeId?.replace("q-", ""))
      : null;
    const parentHasResponse =
      parentQuestionId !== null ? responseMap.has(parentQuestionId) : true;
    const parentThemeCollapsed =
      parentIsTheme && parentNodeId ? collapsedNodeIds.has(parentNodeId) : false;
    const parentQuestionCollapsed =
      parentIsQuestion && parentNodeId ? collapsedNodeIds.has(parentNodeId) : false;
    const themeNodeId = data.themeKey ? `theme-${data.themeKey}` : null;
    const themeCollapsed = themeNodeId ? collapsedNodeIds.has(themeNodeId) : false;
    const isCollapsed = collapsedNodeIds.has(node.id);
    const isCollapsible = parentNodeIdsWithChildren.has(node.id);

    const hasSubtreeResponse = hasResponseInSubtree(node.id);

    const isVisible =
      !parentThemeCollapsed &&
      !parentQuestionCollapsed &&
      !themeCollapsed &&
      parentVisible &&
      (!revealByResponses || hasSubtreeResponse);

    // Statut UI de la question d'après sa réponse projet.
    const responseData = responseMap.get(questionId);
    const hasResponse = Boolean(responseData);
    const isSkipped = responseData?.label == null;

    node.hidden = !isVisible;
    node.data = {
      ...data,
      status: hasResponse ? (isSkipped ? "skipped" : "answered") : "pending",
      keyword: data.keyword,
      isCollapsed,
      isCollapsible,
    };

    visibilityMap.set(node.id, isVisible);
    questionNodesByQuestionId.set(questionId, node);
  });

  // Le placement des nodes de réponse n'est activé que si le mode reveal est actif.
  if (revealByResponses) {
    // Objet de travail pour placer une réponse dans le plan,
    // à partir de sa question parent déjà positionnée.
    type PendingResponsePlacement = {
      response: ProjectResponse;
      questionNode: Node;
      responseDirection: -1 | 1;
      responseX: number;
      preferredY: number;
    };

    const leftPlacements: PendingResponsePlacement[] = [];
    const rightPlacements: PendingResponsePlacement[] = [];

    // Nombre de réponses par question:
    // sert à estimer la "hauteur" occupée par les enfants,
    // afin de réorganiser les questions parents de manière cohérente.
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

    const reflowParentQuestionsForSide = (side: "left" | "right") => {
      // Reflow indépendant par côté (gauche/droite).
      const sideQuestionNodes = Array.from(questionNodesByQuestionId.values())
        .filter((node) => {
          if (node.hidden) return false;
          return side === "left" ? node.position.x < 0 : node.position.x >= 0;
        })
        .sort((a, b) => a.position.y - b.position.y);

      if (sideQuestionNodes.length <= 1) {
        return;
      }

      // Espace minimal vertical entre deux questions voisines,
      // en tenant compte de la taille des sous-arbres réponses.
      const minQuestionGap = COLLISION_Y_THRESHOLD;
      const originalYs = sideQuestionNodes.map((node) => node.position.y);
      const reflowedYs: number[] = [];

      sideQuestionNodes.forEach((node, index) => {
        const questionId = Number((node.data as FlowNodeData).questionId || node.id);
        const responseCount = responseCountByQuestionId.get(questionId) || 0;
        const halfSpan = ((Math.max(responseCount, 1) - 1) * RESPONSE_VERTICAL_GAP) / 2;

        if (index === 0) {
          reflowedYs.push(node.position.y);
          return;
        }

        const previousNode = sideQuestionNodes[index - 1];
        const previousQuestionId = Number(
          (previousNode.data as FlowNodeData).questionId || previousNode.id
        );
        const previousResponseCount =
          responseCountByQuestionId.get(previousQuestionId) || 0;
        const previousHalfSpan =
          ((Math.max(previousResponseCount, 1) - 1) * RESPONSE_VERTICAL_GAP) / 2;

        const minY =
          reflowedYs[index - 1] + previousHalfSpan + halfSpan + minQuestionGap;
        reflowedYs.push(Math.max(node.position.y, minY));
      });

      const originalCenter =
        originalYs.reduce((sum, y) => sum + y, 0) / originalYs.length;
      const reflowedCenter =
        reflowedYs.reduce((sum, y) => sum + y, 0) / reflowedYs.length;
      const centerDelta = originalCenter - reflowedCenter;

      // Recentrage global: évite de "pousser" uniquement vers le bas.
      sideQuestionNodes.forEach((node, index) => {
        node.position = {
          ...node.position,
          y: reflowedYs[index] + centerDelta,
        };
      });
    };

    reflowParentQuestionsForSide("left");
    reflowParentQuestionsForSide("right");

    // Aligne les nodes de 1er niveau (enfants directs de la racine virtuelle)
    // par rang gauche/droite pour éviter que tout le côté droit reste plus bas.
    const rootLevelNodes = Array.from(questionNodesByQuestionId.values()).filter((node) => {
      if (node.hidden) return false;
      const data = node.data as FlowNodeData;
      return data.parentNodeId === "virtual-root";
    });

    const leftRootLevelNodes = rootLevelNodes
      .filter((node) => node.position.x < 0)
      .sort((a, b) => a.position.y - b.position.y);

    const rightRootLevelNodes = rootLevelNodes
      .filter((node) => node.position.x >= 0)
      .sort((a, b) => a.position.y - b.position.y);

    const pairCount = Math.min(leftRootLevelNodes.length, rightRootLevelNodes.length);
    for (let index = 0; index < pairCount; index += 1) {
      const leftNode = leftRootLevelNodes[index];
      const rightNode = rightRootLevelNodes[index];
      const alignedY = (leftNode.position.y + rightNode.position.y) / 2;

      leftNode.position = { ...leftNode.position, y: alignedY };
      rightNode.position = { ...rightNode.position, y: alignedY };
    }

    // Préparation des placements réponses à partir des positions question reflowées.
    projectResponses.forEach((response) => {
      if (response.label == null || String(response.label).trim() === "") {
        return;
      }

      const questionNode = questionNodesByQuestionId.get(Number(response.questionId));
      if (!questionNode) {
        return;
      }

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
        leftPlacements.push(placement);
      } else {
        rightPlacements.push(placement);
      }
    });

    const placeSideResponses = (placements: PendingResponsePlacement[]) => {
      // Collisions gérées uniquement entre réponses d'un même côté.
      const occupiedResponsePositions: Array<{ x: number; y: number }> = [];

      const hasCollision = (x: number, y: number) => {
        return occupiedResponsePositions.some(
          (position) =>
            Math.abs(position.x - x) < COLLISION_X_THRESHOLD &&
            Math.abs(position.y - y) < COLLISION_Y_THRESHOLD
        );
      };

      const getCenteredOffsets = (count: number) => {
        // Distribue les réponses soeurs autour de l'axe vertical du parent.
        const middleIndex = (count - 1) / 2;
        return Array.from({ length: count }, (_, index) =>
          (index - middleIndex) * RESPONSE_VERTICAL_GAP
        );
      };

      const findGroupShift = (x: number, baseYs: number[]) => {
        // Cherche un décalage global du groupe (haut/bas) pour éviter les collisions.
        const maxIterations = 100;
        for (let step = 0; step <= maxIterations; step += 1) {
          const deltas =
            step === 0
              ? [0]
              : [step * RESPONSE_VERTICAL_GAP, -step * RESPONSE_VERTICAL_GAP];

          for (const delta of deltas) {
            const canPlaceGroup = baseYs.every((y) => !hasCollision(x, y + delta));
            if (canPlaceGroup) {
              return delta;
            }
          }
        }
        return 0;
      };

      const groupMap = new Map<string, PendingResponsePlacement[]>();

      // Regroupe les réponses soeurs (même parent + même axe de placement).
      placements.forEach((placement) => {
        const groupKey = `${placement.questionNode.id}|${placement.responseX}|${placement.preferredY}`;
        const group = groupMap.get(groupKey);
        if (group) {
          group.push(placement);
        } else {
          groupMap.set(groupKey, [placement]);
        }
      });

      const groups = Array.from(groupMap.values()).sort(
        (a, b) => a[0].preferredY - b[0].preferredY
      );

      // Placement final groupe par groupe.
      groups.forEach((group) => {
        // Tri stable intra-groupe pour éviter des permutations visuelles arbitraires.
        const sortedGroup = [...group].sort((a, b) => {
          const responseIdA = Number(a.response.responseId ?? 0);
          const responseIdB = Number(b.response.responseId ?? 0);
          if (responseIdA !== responseIdB) {
            return responseIdA - responseIdB;
          }
          return String(a.response.label ?? "").localeCompare(String(b.response.label ?? ""));
        });

        const x = sortedGroup[0].responseX;
        const preferredY = sortedGroup[0].preferredY;
        const centeredOffsets = getCenteredOffsets(sortedGroup.length);
        const baseYs = centeredOffsets.map((offset) => preferredY + offset);
        const groupShift = findGroupShift(x, baseYs);

        sortedGroup.forEach((placement, index) => {
          const responseNodeId = `r-${placement.response.responseId ?? placement.response.questionId}`;
          const responseY = baseYs[index] + groupShift;

          occupiedResponsePositions.push({ x: placement.responseX, y: responseY });

          const responseNode: Node = {
            id: responseNodeId,
            type: "response",
            position: {
              x: placement.responseX,
              y: responseY,
            },
            data: {
              nodeKind: "response",
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

          // Ajout du node réponse et de son edge depuis la question parent.
          baseNodes.push(responseNode);
          baseEdges.push({
            id: `e-${placement.questionNode.id}-${responseNodeId}`,
            source: placement.questionNode.id,
            target: responseNodeId,
          });
        });
      });
    };

    placeSideResponses(leftPlacements);
    placeSideResponses(rightPlacements);
  }

  // Sortie finale prête à être rendue par ReactFlow.
  return { nodes: baseNodes, edges: baseEdges };
}
