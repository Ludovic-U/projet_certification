"use client";

import React from "react";
import { useState, useCallback } from "react";

import { ReactFlow, ControlButton, Controls } from "@xyflow/react"
import '@xyflow/react/dist/style.css';

import { PageHeader, Button, Modal } from "@/components/ui";
import { QuestionNode } from "@/components/ui/Nodes/Question";
import { LeafNode } from "@/components/ui/Nodes/Leaf";
import { Icons, FontAwesomeIcon } from "@/lib/icons";

export default function BuildingPage() {
    const nodeTypes = {
        question: QuestionNode,
        leaf: LeafNode,
    };

    const initialNodes = [
        {
            id: 'n1',
            position: {x: 600, y: 50},
            type: 'question',
            data: { answered: false, label: 'Question 2 ?'},
        },
        {
            id: 'n2',
            position: {x: 500, y: 90},
            type: 'leaf',
            data: {}
        },
        {
            id: 'n3',
            type: 'question',
            position: {x: 600, y: 150},
            data: {label: 'Question 5 ?'}
        },
    ];

    const initialEdges = [
        {
            id: 'n1-n2',
            source: 'n1',
            target: 'n2',
        },
        {
            id: 'n3-n5',
            source: 'n3',
            target: 'n5',
        },
        {
            id: 'n3-n6',
            source: 'n3',
            target: 'n6',
        },
    ];

    // const nodeTypes = { startNode: StartNode };

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 bg-primary/50 flex flex-col items-center justify-center">
                <div className="bg-pink-300 w-[80%] h-[70%]">
                    <div className="bg-light" style={{ height: '100%', width: '100%'}}>
                        <ReactFlow
                         nodes={initialNodes}
                         edges={initialEdges}
                         nodeTypes={nodeTypes}>
                            <Controls showInteractive={false}>
                                <ControlButton>
                                    <FontAwesomeIcon icon={Icons.briefcase}/>    
                                </ControlButton>
                            </Controls>
                        
                            {/* <Background/> */}
                            {/* <Controls/> */}
                        </ReactFlow>
                    </div>
                </div>
            </section>
        </div>
    );
}