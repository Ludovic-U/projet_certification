import { hierarchy, tree, HierarchyNode } from "d3-hierarchy";
import { Node, Edge } from "@xyflow/react"
import { Question } from "@/types/question"

export type TreeNodeKind = "theme" | "question" | "response";

type BuildHierarchyOptions = {
    rootLabel?: string;
};

interface ThemeTreeNode {
    nodeKind: "theme";
    id: string;
    label: string;
    themeKey: string;
    isVirtualRoot?: boolean;
}

type QuestionTreeNode = Question & {
    nodeKind: "question";
    themeKey: string;
};

type TreeHierarchyNode = ThemeTreeNode | QuestionTreeNode;

function isThemeQuestionType(question: Question): boolean {
    const normalizedCategory = typeof question.category === "string"
        ? question.category.trim().toLowerCase()
        : "";

    if (normalizedCategory === "theme" || normalizedCategory === "thème") {
        return true;
    }

    const questionTypes = Array.isArray(question.types) ? question.types : [];
    return questionTypes.some((typeItem) => {
        if (typeof typeItem === "object" && typeItem?.label) {
            const normalizedLabel = String(typeItem.label).trim().toLowerCase();
            return normalizedLabel === "theme" || normalizedLabel === "thème";
        }
        return false;
    });
}

/**
 * Construit une hiérarchie D3 à partir d'un tableau des questions.
 * Chaque question peut avoir un parent (idParent) et ainsi créer un arbre.
 * @param questions - Tableau de toutes les questions
 * @returns root - La racine de l'arbre D3
*/
export function buildHierarchy(questions: Question[], options?: BuildHierarchyOptions) {
    const questionsByParent = new Map<string, Question[]>();

    questions.forEach((question) => {
        const parentKey = question.parentId == null ? "root" : String(question.parentId);
        const current = questionsByParent.get(parentKey) ?? [];
        current.push(question);
        questionsByParent.set(parentKey, current);
    });

    const virtualRoot: ThemeTreeNode = {
        nodeKind: "theme",
        id: "virtual-root",
        label: options?.rootLabel ?? "Ideation",
        themeKey: "virtual-root",
        isVirtualRoot: true,
    };

    const root = hierarchy<TreeHierarchyNode>(virtualRoot, (nodeData) => {
        if (nodeData.isVirtualRoot) {
            const rootQuestions = questionsByParent.get("root") ?? [];
            return rootQuestions.map((question) => ({
                ...question,
                nodeKind: "question" as const,
                themeKey: nodeData.themeKey,
            }));
        }

        if (nodeData.nodeKind !== "question") {
            return [];
        }

        const nodeQuestionId = String(nodeData.questionId ?? nodeData.id);
        const children = questionsByParent.get(nodeQuestionId) ?? [];
        return children.map((question) => ({
            ...question,
            nodeKind: "question" as const,
            themeKey: (nodeData as QuestionTreeNode).themeKey,
        }));
    });

    return root;
}

/**
 * Calcule la disposition (layout) de type "tidy tree" pour la hiérarchie D3.
 * Chaque noeud obtient des coordonnées 'x' et 'y' pour l'afficher.
 * Layout horizontal : les noeuds progressent de gauche à droite.
 * 
 * @param root - La racine de l'arbre
 * @returns  root - La racine enrichie avec les coordonnées de chaque noeud
 */
export function computeTreeLayout(root: HierarchyNode<TreeHierarchyNode>) {
    const MIN_VERTICAL_GAP = 95;

    // Création d'un layout en arbre horizontal
    // nodeSize([hauteur verticale, espacement horizontal]) définit l'espacement entre les noeuds.
    const treeLayout = tree<TreeHierarchyNode>()
        .nodeSize([110, 220]) // [hauteur entre niveaux verticaux, largeur entre niveaux horizontaux]
        .separation((a, b) => {
            const siblingFactor = a.parent === b.parent ? 1.2 : 1.8;
            const densityFactor =
                1 + ((a.children?.length ?? 0) + (b.children?.length ?? 0)) * 0.08;
            return siblingFactor * densityFactor;
        });

    // Applique le layout à la hiérarchie
    // Chaque noeud a "x" et "y"
    treeLayout(root);

    const nodesByDepth = new Map<number, HierarchyNode<TreeHierarchyNode>[]>();
    root.descendants().forEach((node) => {
        const current = nodesByDepth.get(node.depth) ?? [];
        current.push(node);
        nodesByDepth.set(node.depth, current);
    });

    nodesByDepth.forEach((nodesAtDepth) => {
        if (nodesAtDepth.length <= 1) {
            return;
        }

        const ordered = [...nodesAtDepth].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
        const originalMean =
            ordered.reduce((sum, node) => sum + (node.x ?? 0), 0) / ordered.length;

        for (let index = 1; index < ordered.length; index += 1) {
            const previous = ordered[index - 1];
            const current = ordered[index];
            const previousX = previous.x ?? 0;
            const currentX = current.x ?? 0;
            const delta = currentX - previousX;

            if (delta < MIN_VERTICAL_GAP) {
                current.x = previousX + MIN_VERTICAL_GAP;
            }
        }

        const adjustedMean =
            ordered.reduce((sum, node) => sum + (node.x ?? 0), 0) / ordered.length;
        const recenterOffset = originalMean - adjustedMean;
        ordered.forEach((node) => {
            node.x = (node.x ?? 0) + recenterOffset;
        });
    });

    return root;
}

/**
 * Convertit une hiérarchie D3 en nodes et edges pour React Flow
 * Layout horizontal : inverse x et y pour progression de gauche à droite
 * @param root - La racine de l'arbre
 * @returns nodes, edges - Noeuds et arêtes prêts pour React Flow
 */
export function d3ToReactFlow(root: HierarchyNode<TreeHierarchyNode>): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const topLevelNodes = root.children ?? [];
    const orderedTopLevelNodes = [...topLevelNodes].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
    const leftCount = Math.ceil(orderedTopLevelNodes.length / 2);
    const branchDirectionByTopLevelId = new Map<string, -1 | 1>();

    orderedTopLevelNodes.forEach((node, index) => {
        const topLevelId = String((node.data as QuestionTreeNode).questionId ?? (node.data as QuestionTreeNode).id);
        branchDirectionByTopLevelId.set(topLevelId, index < leftCount ? -1 : 1);
    });

    const getBranchDirection = (node: HierarchyNode<TreeHierarchyNode>): -1 | 1 => {
        if (!node.parent) {
            return 1;
        }

        let current: HierarchyNode<TreeHierarchyNode> = node;
        while (current.parent && !Boolean((current.parent.data as ThemeTreeNode).isVirtualRoot)) {
            current = current.parent;
        }

        const topLevelId = String((current.data as QuestionTreeNode).questionId ?? (current.data as QuestionTreeNode).id);
        return branchDirectionByTopLevelId.get(topLevelId) ?? 1;
    };

    root.descendants().forEach(node => {
        const isVirtualRoot = Boolean((node.data as ThemeTreeNode).isVirtualRoot);
        const isTheme = node.data.nodeKind === "theme" && !isVirtualRoot;
        const isQuestion = node.data.nodeKind === "question";
        const isThemeQuestion = isQuestion && isThemeQuestionType(node.data as QuestionTreeNode);
        const nodeVisualKind: TreeNodeKind = isVirtualRoot || isTheme || isThemeQuestion ? "theme" : "question";
        const branchDirection = getBranchDirection(node);

        const rawId = isQuestion
            ? String((node.data as QuestionTreeNode).questionId ?? (node.data as QuestionTreeNode).id)
            : String((node.data as ThemeTreeNode).id);

        const nodeId = isQuestion ? `q-${rawId}` : rawId;

        const parentId = node.parent
            ? node.parent.data.nodeKind === "question"
                ? `q-${String((node.parent.data as QuestionTreeNode).questionId ?? (node.parent.data as QuestionTreeNode).id)}`
                : String((node.parent.data as ThemeTreeNode).id)
            : null;

        // Inverser x et y pour un layout horizontal (gauche à droite)
        // D3 tree : x = vertical, y = horizontal
        // ReactFlow : x = horizontal, y = vertical
        nodes.push({
            id: nodeId,
            type: nodeVisualKind,
            position: { 
                x: (node.y ?? 0) * branchDirection,  // Profondeur → axe horizontal (gauche/droite)
                y: (node.x ?? 0)   // Position dans le niveau → axe vertical
            },
            data: {
                ...node.data,
                nodeKind: nodeVisualKind,
                status: (node.data as QuestionTreeNode).status || "pending",
                depth: node.depth,
                parentNodeId: parentId,
                isVirtualRoot,
            },
            hidden: isVirtualRoot,
        });

        if (node.parent && !isVirtualRoot) {
            const sourceId = node.parent.data.nodeKind === "question"
                ? `q-${String((node.parent.data as QuestionTreeNode).questionId ?? (node.parent.data as QuestionTreeNode).id)}`
                : String((node.parent.data as ThemeTreeNode).id);

            edges.push({
                id: `e-${sourceId}-${nodeId}`,
                source: sourceId,
                target: nodeId,
            });
        }
    });
    
    return { nodes, edges };
}

export function generateNodesWithMultiply(questions: Question[], parentAnswers: Record<string, string[]> = {}) {
    const nodes: Node[] = [];

    questions.forEach((q: Question) => {
        const parentId = q.parentId?.toString() ?? null;

        nodes.push({
            id: q.questionId.toString(),
            type: "question",
            data: { ...q, parentId },
            position: { x: 0, y: 0 },
            hidden: true,
        });
    });

    return nodes;
}