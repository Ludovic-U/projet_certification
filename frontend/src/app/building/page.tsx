"use client";

import React from "react";

import { PageHeader, Button, Modal, Tooltip } from "@/components/ui";
import CreateQuestionForm from "@/components/forms/CreateQuestion";

import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";

export default function BuildingPage() {

    const questionModal = useModal()

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 flex flex-col items-center justify-center">
                    <div>
                        <Tooltip content="Ajouter une question" position="rightBottom">
                            <Button
                            onClick={questionModal.openModal}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouvelle question
                            </Button>
                        </Tooltip>
                        <Modal modal={questionModal}
                        title="AJOUTER UNE QUESTION"
                        description="Entrez les informations de la nouvelle question">
                            <CreateQuestionForm/>
                        </Modal>
                    </div>
            </section>
        </div>
    );
}