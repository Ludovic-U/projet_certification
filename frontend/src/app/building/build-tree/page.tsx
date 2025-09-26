"use client";

import React from "react";
import { useState, useCallback } from "react";

import { ReactFlow, ControlButton, Controls } from "@xyflow/react"
import '@xyflow/react/dist/style.css';

import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks"
import { PageHeader, Button, Modal } from "@/components/ui";

import { QuestionNode } from "@/components/ui/Nodes/Question";
import { LeafNode } from "@/components/ui/Nodes/Leaf";

import Question from "@/components/forms/QuestionForm";


export default function BuildingPage() {
    const nodeTypes = {
        point: QuestionNode,
        leaf: LeafNode,
    };

    const initialNodes = [
        {
            id: 'n1',
            position: {x: 600, y: 50},
            type: 'point',
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
            type: 'point',
            position: {x: 600, y: 150},
            data: {label: 'Question 5 ?'}
        },
    ];

    // const initialEdges = [
    //     {
    //         id: 'n1-n2',
    //         source: 'n1',
    //         target: 'n2',
    //     },
    // ];

    const modal = useModal();
    const qst = "Pouvez-vous expliquer ces obstacles aussi simplement que possible ?"

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build - TREE" description="app/building/build-tree/page.tsx"/>
            <section className="flex-1 bg-primary/50 flex flex-col items-center justify-center">
                <div className="bg-pink-300 w-[80%] h-[70%]">
                    <div className="bg-light" style={{ height: '100%', width: '100%'}}>
                        <ReactFlow
                         nodes={initialNodes}
                         onNodeClick={modal.openModal}
                        //  edges={initialEdges}
                         nodeTypes={nodeTypes}>
                            <Controls showInteractive={false}>
                                <ControlButton>
                                    <FontAwesomeIcon icon={Icons.briefcase}/>    
                                </ControlButton>
                            </Controls>
                            {/* <Background/> */}
                            {/* <Controls/> */}
                        </ReactFlow>
                        <Modal
                        modal={modal}
                        title={qst}>
                            <textarea className="border rounded-lg h-40 w-70 p-2 resize-none"/>
                            <Button className="mt-5">Valider</Button>
                        </Modal>
                    </div>
                </div>
            </section>
        </div>
    );
}