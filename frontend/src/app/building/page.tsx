"use client";

import React from "react";

import { PageHeader, Button, Modal, Tooltip } from "@/components/ui";
import CreateClientForm from "@/components/forms/CreateClient"

import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";

export default function BuildingPage() {

    const modal = useModal()

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 flex flex-col items-center justify-center">
                <Tooltip content="Ajouter un client" position="rightTop">
                    <Button
                    onClick={modal.openModal}
                    size="sm">
                        <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                            <FontAwesomeIcon icon={Icons.plus}/>
                        </div>
                        Nouveau client
                    </Button>
                </Tooltip>
                <Modal modal={modal}
                 title="AJOUTER UN CLIENT"
                 description="Entrez les informations du nouveau client">
                    <CreateClientForm/>
                </Modal>
            </section>
        </div>
    );
}