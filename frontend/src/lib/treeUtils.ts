import { hierarchy, tree, HierarchyNode } from "d3-hierarchy";
import { Node, Edge } from "@xyflow/react"
import { Question } from "@/types/question"

/**
 * Construit une hiérarchie D3 à partir d'un tableau des questions.
 * Chaque question peut avoir un parent (questionIdParent) et ainsi créer un arbre.
 * @param questions - Tableau de toutes les questions
 * @returns root - La racine de l'arbre D3
*/
export function buildHierarchy(questions: Question[]) {
    // Récupère la racine : la question sans parent
    const rootQuestion = questions.find(q => q.questionIdParent === null);
    
    // Si aucune racine n'est trouvée, on renvoie une erreur
    if (!rootQuestion) {
        throw new Error("Pas de racine trouvée")
    };
    
    // Création de la hiérarchie D3
    // 'hierarchy' prend un élément racine et une fonction pour récupérer ses enfants
    const root = hierarchy(rootQuestion, (node: any) => {
        // Cherche toutes les questions dont le parent est 'node.questionId'
        return questions.filter(q => q.questionIdParent === node.questionId);
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
    const treeLayout = tree<Question>().nodeSize([30, 30]);

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
        nodes.push({
            id: node.data.questionId.toString(),
            type: node.children && node.children.length > 0 ? "question" : "leaf",
            position: { 
                x: (node.x ?? 0) * scale,
                y: (node.y ?? 0) * scale
            },
            data: node.data as unknown as Record<string, unknown>,
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

