"use client";

import React from "react";

import { PageHeader, Button, Modal, Tooltip } from "@/components/ui";
import CreateUserForm from "@/components/forms/CreateClient"

import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";

export default function BuildingPage() {

    const modal = useModal()

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 flex flex-col items-center justify-center">
                    <div>
                        <Tooltip content="Ajouter un utilisateur" position="rightBottom">
                            <Button
                            onClick={modal.openModal}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouvel utilisateur
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title="AJOUTER UN UTILISATEUR"
                        description="Entrez les informations du nouvel utilisateur">
                            <CreateUserForm/>
                        </Modal>
                    </div>
            </section>
        </div>
    );
}