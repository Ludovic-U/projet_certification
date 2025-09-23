"use client";

import { PageHeader, Modal, Button } from "@/components/ui";
import CreateProject from "@/components/forms/CreateProject"
import React from "react";
import { useState } from "react";
import { useModal } from "@/hooks";

export default function BuildingPage() {
    const modal = useModal()

    return (
        <div className="h-full">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="">
                <Button onClick={modal.openModal}>
                    Ouvrir
                </Button>
                <Modal modal={modal} title="Titre">
                    <CreateProject/>
                </Modal>
            </section>
        </div>
    );
}