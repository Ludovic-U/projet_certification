import { hierarchy, tree, HierarchyNode } from "d3-hierarchy";
import { Node, Edge } from "@xyflow/react"
import { Question } from "@/types/question"

/**
 * Construit une hiérarchie D3 à partir d'un tableau des questions.
 * Chaque question peut avoir un parent (idParent) et ainsi créer un arbre.
 * @param questions - Tableau de toutes les questions
 * @returns root - La racine de l'arbre D3
*/
export function buildHierarchy(questions: Question[]) {
    const virtualRoot = {
        questionId: "virtual-root",
        label: "Racine",
        answered: false,
        parentId: null,
        status: "pending",
        isVirtualRoot: true,
    } as Question & { isVirtualRoot: boolean };
    
    // Création de la hiérarchie D3
    // 'hierarchy' prend un élément racine et une fonction pour récupérer ses enfants
    const root = hierarchy(virtualRoot, (node: any) => {
        if (node.isVirtualRoot) {
            return questions.filter(q => q.parentId === null);
        }
        const nodeId = node.questionId ?? node.id;
        return questions.filter(
            q => q.parentId !== null && String(q.parentId) === String(nodeId)
        );
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
export function computeTreeLayout(root: HierarchyNode<Question>) {
    // Création d'un layout en arbre horizontal
    // nodeSize([hauteur verticale, espacement horizontal]) définit l'espacement entre les noeuds.
    const treeLayout = tree<Question>()
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
export function d3ToReactFlow(root: HierarchyNode<Question>): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    root.descendants().forEach(node => {
        const isRoot = node.depth === 0;
        const questionData = node.data as Question;
        const isVirtualRoot = Boolean((node.data as any).isVirtualRoot);

        // Inverser x et y pour un layout horizontal (gauche à droite)
        // D3 tree : x = vertical, y = horizontal
        // ReactFlow : x = horizontal, y = vertical
        nodes.push({
            id: questionData.questionId.toString(),
            type: "question",
            position: { 
                x: (node.y ?? 0),  // Profondeur → axe horizontal
                y: (node.x ?? 0)   // Position dans le niveau → axe vertical
            },
            data: {
                ...node.data,
                status: node.data.status || "pending",
                isRoot,
                isVirtualRoot,
            } as Question & { isRoot?: boolean },
            // Cacher tous les nœuds sauf la racine et le niveau racine
            hidden: !isRoot && node.data.parentId !== null,
        });

        if (node.parent) {
            edges.push({
                id: `n-${node.parent.data.questionId}-n${node.data.questionId}`,
                source: node.parent.data.questionId.toString(),
                target: node.data.questionId.toString(),
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