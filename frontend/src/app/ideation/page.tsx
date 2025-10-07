"use client";

import React, { useMemo } from "react";

import { ReactFlow, ControlButton, Controls, ControlPosition} from "@xyflow/react"
import '@xyflow/react/dist/style.css';

import { buildHierarchy, computeTreeLayout, d3ToReactFlow } from "@/lib/treeUtils"
import { Question } from "@/types/question";

import { QuestionNode } from "@/components/ui/Nodes/Question";
import { LeafNode } from "@/components/ui/Nodes/Leaf";

import { PageHeader, Card } from "@/components/ui";

const nodeTypes = { question: QuestionNode, leaf: LeafNode};

const sampleQuestions: Question[] = [
    { questionId: 0, label: "root_virtual", questionIdParent: null},
    { questionId: 1, label: "Root", questionIdParent: 0 },
    { questionId: 2, label: "Child 1", questionIdParent: 0 },
    { questionId: 3, label: "Child 2", questionIdParent: 0 },
    { questionId: 4, label: "Leaf 1", questionIdParent: 0 },
    { questionId: 5, label: 'Child 3', questionIdParent: 2 },
    { questionId: 6, label: "Leaf 2", questionIdParent: 2 },
    { questionId: 7, label: 'Leaf 3', questionIdParent: 2 },
    { questionId: 8, label: "Child x", questionIdParent: 2 },
    { questionId: 9, label: "Child x", questionIdParent: 6 },
    { questionId: 10, label: "Child x", questionIdParent: 3 },
]

export default function IdeationPage() {

    const { nodes, edges } = useMemo(() => {
        const root = computeTreeLayout(buildHierarchy(sampleQuestions));
        return d3ToReactFlow(root);
    }, []);

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Projet Lambda - IDEATION" description="Dans cette étape, vous pouvez rassembler vos idées, définir les besoins principaux et commencer à poser les bases de votre projet en répondant aux questions."/>
            <section className="flex flex-1 flex-col items-center">
                <div className="h-fit z-10">
                    <Card
                    color="#9CCA95"
                    title="Synthèse des projets"
                    progress={30}/>                    
                </div>

                 <div className="flex rounded-xl flex-col m-5 mt-0 bg-light flex-1 w-[80%] items-center justify-center">
                    <ReactFlow
                     nodeTypes={nodeTypes}
                     nodes={nodes}
                     edges={edges}
                     defaultEdgeOptions={{
                        type: "step",
                        style: { strokeWidth: 2}
                     }}
                    >
                        <Controls position="bottom-center" orientation="horizontal" showInteractive={false}/>
                        
                    </ReactFlow>
                 </div>

                 <div className="flex gap-8 h-fit">
                    <Card color="#7EA478" title="Proposition des valeurs" buttonLabel="Voir"/>
                    <Card color="#627F5D" title="Analyse de l'existant" buttonLabel="Voir"/>
                    <Card color="#495F46" title="Auto-positionnement" buttonLabel="Voir"/>
                 </div>
            </section>
        </div>
    );
}