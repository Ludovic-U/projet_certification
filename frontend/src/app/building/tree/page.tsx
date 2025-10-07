"use client";

import React, { useEffect, useMemo } from "react";
import {ReactFlow, Background, Controls } from "@xyflow/react";
import { QuestionNode } from "@/components/ui/Nodes/Question";
import { LeafNode } from "@/components/ui/Nodes/Leaf";
import { buildHierarchy, computeTreeLayout, d3ToReactFlow } from "@/lib/treeUtils"
import { Question } from "@/types/question";
import '@xyflow/react/dist/style.css';

const nodeTypes = { question: QuestionNode, leaf: LeafNode };

const sampleQuestions: Question[] = [
    { questionId: 1, label: "Root", questionIdParent: null },
    { questionId: 2, label: "Child 1", questionIdParent: 1 },
    { questionId: 3, label: "Child 2", questionIdParent: 1 },
    { questionId: 4, label: "Leaf 1", questionIdParent: 1 },
    { questionId: 5, label: 'Child 3', questionIdParent: 1},
    { questionId: 6, label: "Leaf 2", questionIdParent: 1},
    { questionId: 7, label: 'Leaf 3', questionIdParent: 1},
    { questionId: 8, label: "Child x", questionIdParent: 1}
];


export default function QuestionsTree() {
    const { nodes, edges } = useMemo(() => {
        const root = computeTreeLayout(buildHierarchy(sampleQuestions));
        return d3ToReactFlow(root);
    }, []);

    return (
        <div className="h-full w-full bg-pink-200">
            <ReactFlow
             nodes={nodes}
             edges={edges.map(e => ({...e, animated: true, style: {stroke: "red", strockeWidth: 2 } }))}
             nodeTypes={nodeTypes}
             fitView
             fitViewOptions={{ padding: 0.2 }}>
                <Background/>
                <Controls/>
            </ReactFlow>
        </div>
    )
}