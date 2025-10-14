"use client";

import React, { useState, useMemo } from "react";
import { ReactFlow, Node, Edge, Controls, ControlButton } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Question } from "@/types/question";
import { QuestionNode } from "../Nodes/Question";
import { buildHierarchy, computeTreeLayout, d3ToReactFlow, generateNodesWithMultiply } from "@/lib/treeUtils";
import ModalQuestion from "../ModalQuestion/ModalQuestion";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";
import {
    ReponseUnique,
    ReponsesPlusieurs,
    ReponseSelect
} from "@/components/forms";

interface TreeViewProps {
    questions: Question[]
    onNodesChange?: (nodes: Node[]) => void;
}

export default function TreeView({ questions, onNodesChange }: TreeViewProps) {

    // Génération automatique du layout avec D3
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!questions || questions.length === 0) {
            console.warn("Aucune question à afficher - arbre vide")
            return { nodes: [], edges: [] };
        }
        
        const root = buildHierarchy(questions);
        const laidOutRoot = computeTreeLayout(root);
        const { nodes, edges } = d3ToReactFlow(laidOutRoot);

        nodes.forEach(n => {
            console.log(`node ${n.id} options:`, n.data.options)
        });

        return { nodes, edges };
    }, [questions]);

    // Etats ReactFlow et Modal
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges)
    const modal = useModal();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const handleNodeClick = (_: any, node: Node) => {
        setSelectedNode(node);
        console.log("question :", node.data);
        console.log("options :", (node.data as Question).options);
        modal.openModal();
    }

    // Gestion du clique sur noeud
    const updateNodeStatus = (status: "answered" | "skipped") => {
        if (!selectedNode) return;

        setNodes(prev => {
            const newNodes = prev.map(n => {
                // Mise à jour du node sélectionné
                if (n.id === selectedNode.id) {
                    return {
                        ...n,
                        data: { ...n.data, status}
                    };
                }
                // Débloque les enfants directs
                if (n.data.parentId?.toString() === selectedNode.id.toString()) {
                    return { ...n, hidden: false};
                }
                return n;
            });
            // Remonter l'état si callback
            onNodesChange?.(newNodes)
            return newNodes
        });

        modal.closeModal();
    }

    // Validation d'une réponse
    const handleValidate = () => updateNodeStatus("answered")
    // Passer la question
    const handleSkip = () => updateNodeStatus("skipped");

    // Définition des types de noeuds
    const nodeTypes = useMemo(() => ({
        question: QuestionNode,
    }), []);

    return (
        <div className="h-full w-full">
            <ReactFlow
             nodes={nodes}
             edges={edges}
             defaultEdgeOptions={{ type: "step", style: {stroke: "#272727"}}}
             nodeTypes={nodeTypes}
             onNodeClick={handleNodeClick}
             fitView
             fitViewOptions={{
                padding: 0.2,
                minZoom: 0.8,
                nodes: nodes.filter(n => !(n.data as any).isRoot)
             }}>
                <Controls showInteractive={false}>
                    <ControlButton>
                        <FontAwesomeIcon icon={Icons.briefcase}/>    
                    </ControlButton>
                </Controls>
            </ReactFlow>
            
            {/* Renvoie du bon formulaire de réponse */}
            {selectedNode && (() => {
                const question = selectedNode.data as Question;
                let ResponseForm;
                if (question.shouldMultiply) ResponseForm = () => <div>Question répétée</div>;
                else if (question.hasMultipleOpenResponse) ResponseForm = ReponsesPlusieurs;
                else if (question.options?.length > 0 ) ResponseForm = () => <ReponseSelect options={question.options}/>;
                else ResponseForm = ReponseUnique;

                return (
                    <ModalQuestion
                     modal={modal}
                     question={question.label || "question"}
                     questionId={question.id?.toString() || "id"}
                     onValidate={handleValidate}
                     onSkip={handleSkip}>
                        <ResponseForm/>
                    </ModalQuestion>
                );
            })()}
        </div>
    )
}