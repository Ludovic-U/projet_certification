import { hierarchy, tree, HierarchyNode } from "d3-hierarchy";
import { Node, Edge } from "@xyflow/react"
import { Question } from "@/types/question"

export type TreeNodeKind = "theme" | "question" | "response";

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

const DEFAULT_THEME_LABEL = "Sans thème";

function normalizeThemeLabel(question: Question): string {
    if (typeof question.category === "string" && question.category.trim() !== "") {
        return question.category.trim();
    }

    const questionCategory = (question as any)?.questionCategory;
    if (questionCategory?.label && typeof questionCategory.label === "string") {
        return questionCategory.label.trim();
    }

    return DEFAULT_THEME_LABEL;
}

function themeKeyFromLabel(label: string): string {
    return label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_]/g, "");
}

/**
 * Construit une hiérarchie D3 à partir d'un tableau des questions.
 * Chaque question peut avoir un parent (idParent) et ainsi créer un arbre.
 * @param questions - Tableau de toutes les questions
 * @returns root - La racine de l'arbre D3
*/
export function buildHierarchy(questions: Question[]) {
    const questionsByParent = new Map<string, Question[]>();
    const themeByQuestionId = new Map<string, string>();
    const themes = new Map<string, ThemeTreeNode>();

    questions.forEach((question) => {
        const qId = String(question.questionId ?? question.id);
        const parentKey = question.parentId == null ? "root" : String(question.parentId);
        const current = questionsByParent.get(parentKey) ?? [];
        current.push(question);
        questionsByParent.set(parentKey, current);

        const label = normalizeThemeLabel(question);
        const key = themeKeyFromLabel(label) || "sans-theme";
        if (!themes.has(key)) {
            themes.set(key, {
                nodeKind: "theme",
                id: `theme-${key}`,
                label,
                themeKey: key,
            });
        }
        themeByQuestionId.set(qId, key);
    });

    const virtualRoot: ThemeTreeNode = {
        nodeKind: "theme",
        id: "virtual-root",
        label: "Idéation",
        themeKey: "virtual-root",
        isVirtualRoot: true,
    };

    const root = hierarchy<TreeHierarchyNode>(virtualRoot, (nodeData) => {
        if (nodeData.isVirtualRoot) {
            return Array.from(themes.values());
        }

        if (nodeData.nodeKind === "theme") {
            const themeQuestions = questionsByParent.get("root") ?? [];
            return themeQuestions
                .filter((question) => {
                    const qId = String(question.questionId ?? question.id);
                    return themeByQuestionId.get(qId) === nodeData.themeKey;
                })
                .map((question) => ({
                    ...question,
                    nodeKind: "question" as const,
                    themeKey: nodeData.themeKey,
                }));
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
    // Création d'un layout en arbre horizontal
    // nodeSize([hauteur verticale, espacement horizontal]) définit l'espacement entre les noeuds.
    const treeLayout = tree<TreeHierarchyNode>()
        .nodeSize([100, 200]) // [hauteur entre niveaux verticaux, largeur entre niveaux horizontaux]
        .separation((a,b) => a.parent === b.parent ? 1 : 1.5);

    // Applique le layout à la hiérarchie
    // Chaque noeud a "x" et "y"
    treeLayout(root);

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

    root.descendants().forEach(node => {
        const isVirtualRoot = Boolean((node.data as ThemeTreeNode).isVirtualRoot);
        const isTheme = node.data.nodeKind === "theme" && !isVirtualRoot;
        const isQuestion = node.data.nodeKind === "question";

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
            type: isTheme ? "theme" : "question",
            position: { 
                x: (node.y ?? 0),  // Profondeur → axe horizontal
                y: (node.x ?? 0)   // Position dans le niveau → axe vertical
            },
            data: {
                ...node.data,
                nodeKind: isTheme ? "theme" : "question",
                status: (node.data as QuestionTreeNode).status || "pending",
                depth: node.depth,
                parentNodeId: parentId,
                isVirtualRoot,
            },
            hidden: isVirtualRoot,
        });

        if (node.parent && !isVirtualRoot && !(node.parent.data as ThemeTreeNode).isVirtualRoot) {
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

        if (q.shouldMultiply && parentId && parentAnswers[parentId]?.length > 0) {
            parentAnswers[parentId].forEach(answer => {
                nodes.push({
                    id: `${q.id}_${answer}`,
                    type: "question",
                    data: {
                        ...q,
                        label: q.label?.replace("{{context}}", answer) ?? q.label,
                        context: answer,
                        parentId
                    },
                    position: { x: 0, y: 0},
                    hidden: true,
                });
            });
        } else {
            nodes.push({
                id: q.questionId.toString(),
                type: "question",
                data: { ...q, parentId },
                position: { x: 0, y: 0 },
                hidden: true,
            });
        }
    });

    return nodes;
}