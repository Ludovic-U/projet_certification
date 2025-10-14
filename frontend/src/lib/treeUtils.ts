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
    // Récupère la racine : la question sans parent
    const rootQuestion = questions.find(q => q.parentId === null);
    
    // Si aucune racine n'est trouvée, on renvoie une erreur
    if (!rootQuestion) {
        console.warn("Pas de racine trouvée")
        return null
    };
    
    // Création de la hiérarchie D3
    // 'hierarchy' prend un élément racine et une fonction pour récupérer ses enfants
    const root = hierarchy(rootQuestion, (node: any) => {
        // Cherche toutes les questions dont le parent est 'node.id'
        return questions.filter(q => q.parentId === node.id);
    });

     return root;
}

/**
 * Calcule la disposition (layout) de type "tidy tree" pour la hiérarchie D3.
 * Chaque noeud obtion des coordonnées 'x' et 'y' pour l'afficher.
 * 
 * @param root - La racine de l'arbre
 * @returns  root - La racine enrichie avec les coordonnées de chaque noeud
 */
export function computeTreeLayout(root: HierarchyNode<Question>) {
    // Création d'un layout en arbre
    // nodeSize([hauteur, largeur]) définit l'espacement entre les noeuds.
    const treeLayout = tree<Question>().nodeSize([20, 20]).separation((a,b) => a.parent === b.parent ? 1 : 2);

    // Applique le layout à la hiérarchie
    // Chaque noeud a "x" et "y"
    treeLayout(root);

    return root;
}

/**
 * Convertit une hiérarchie D3 en nodes et edges pour React Flow
 * @param root - La racine de l'arbre
 * @returns nodes, edges - Noeuds et arêtes prêts pour React Flow
 */
export function d3ToReactFlow(root: HierarchyNode<Question>): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const scale = 3;

    root.descendants().forEach(node => {
        const isRoot = node.depth === 0;

        nodes.push({
            id: node.data.id.toString(),
            type: "question",
            position: isRoot
                ? { x: 0, y: -40 }
                : { x: (node.x ?? 0) * scale, y: (node.y ?? 0) * scale },
            data: {
                ...node.data,
                status: node.data.status || "pending",
                isRoot,
            } as Question & { isRoot?: boolean },
            hidden: node.depth > 1 ? true : false,
            style: isRoot
                ? { opacity: 0, pointerEvents: "none" }
                : undefined,
        });

        if (node.parent) {
            edges.push({
                id: `n-${node.parent.data.id}-n${node.data.id}`,
                source: node.parent.data.id.toString(),
                target: node.data.id.toString(),
            });
        }
    });
    
    return { nodes, edges };
}

export function generateNodesWithMultiply(questions: Question[], parentAnswers: Record<string, string[]> = {}) {
    const nodes: Node[] = [];

    questions.forEach(q => {
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
                id: q.id.toString(),
                type: "question",
                data: { ...q, parentId },
                position: { x: 0, y: 0 },
                hidden: true,
            });
        }
    });

    return nodes;
}