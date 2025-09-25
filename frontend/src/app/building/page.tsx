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

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 bg-primary/50 flex flex-col items-center justify-center">
                <div className="bg-pink-300 w-[80%] h-[70%]">
                    <div className="bg-light" style={{ height: '100%', width: '100%'}}>
                        <ReactFlow>

                        </ReactFlow>
                    </div>
                </div>
            </section>
        </div>
    );
}