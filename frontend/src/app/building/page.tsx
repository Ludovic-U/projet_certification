"use client";

import React from "react";
import { useState, useCallback } from "react";

import { ReactFlow, ControlButton, Controls } from "@xyflow/react"
import '@xyflow/react/dist/style.css';

import { PageHeader, Button, Modal, Input } from "@/components/ui";
import { QuestionNode } from "@/components/ui/Nodes/Question";
import { LeafNode } from "@/components/ui/Nodes/Leaf";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";
import CreateClientForm from "@/components/forms/CreateClient"

export default function BuildingPage() {

    const modal = useModal()

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 flex flex-col items-center justify-center">
                <Button onClick={modal.openModal}>Ouvrir</Button>
                    <Modal modal={modal}
                     title="AJOUTER UN CLIENT"
                     description="Entrez les informations du nouveau client">
                        <CreateClientForm/>
                    </Modal>
            </section>
        </div>
    );
}