"use client";

import React, { useState } from "react";
import { Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css"
import { PageHeader, Card, Modal, Table, Button } from "@/components/ui";
import { questionsList } from "@/components/ui/Table/table.variants/questions";
import TreeView from "@/components/ui/Tree/TreeView";
import { useProjectQuestion } from "@/hooks/useProjectQuestions";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { LoadingSpinner } from "@/components/ui";
import { useModal } from "@/hooks";
import { Question } from "@/types/question";

import {
    ReponseUnique,
    ReponsesPlusieurs,
    ReponseSelect
} from "@/components/forms";

import ModalQuestion from "@/components/ui/ModalQuestion/ModalQuestion";

export default function IdeationPage() {
    const projectId = 1;
    const { questions, loading } = useProjectQuestion(projectId);
    const [nodesState, setNodesState] = useState<Node[]>([]);
    const modalQuestions = useModal();
    const modalResponse = useModal();
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const progress = nodesState.filter(
        (n) => n.data?.status === "answered" || n.data?.status === "skipped"
    ).length;

    const maxQuestions = nodesState.length - 1 || questions.length - 1;

    if (loading) return <div className="flex">Chargement des questions...<LoadingSpinner/></div>

    const handleOpenQuestion = (question: Question) => {
        setSelectedQuestion(question);
        modalResponse.openModal();
    };

    const getResponseForm = (question: Question) => {
        if (question.shouldMultiply)
            return () => <div>Question répétée</div>;
        if (question.hasMultipleOpenResponse)
            return ReponsesPlusieurs;
        if (question.options?.length > 0 )
            return () => <ReponseSelect options={question.options}/>;
        return ReponseUnique;
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader
             title="Projet Lambda - IDEATION"
             description="Dans cette étape, vous pouvez rassembler vos idées, définir les besoins principaux et commencer à poser les bases de votre projet en répondant aux questions."
            />
            <section className="flex flex-1 flex-col items-center">
                <div className="h-fit z-10">
                    <Card
                    color="#9CCA95"
                    title="Synthèse des projets"
                    max={maxQuestions}
                    progress={progress}
                    buttonLabel="voir toutes les questions"
                    onButtonClick={modalQuestions.openModal}/>
                </div>

                <div className="flex rounded-xl flex-col m-5 mt-0 bg-light flex-1 w-[80%] items-center justify-center">
                    <TreeView
                     questions={questions}
                     onNodesChange={setNodesState}
                    />
                 </div>

                 <div className="flex gap-8 h-fit">
                    <Card color="#7EA478" title="Proposition des valeurs" buttonLabel="Voir"/>
                    <Card color="#627F5D" title="Analyse de l'existant" buttonLabel="Voir"/>
                    <Card color="#495F46" title="Auto-positionnement" buttonLabel="Voir"/>
                 </div>
            </section>

            <Modal
            modal={modalQuestions}
            title="Toutes les questions">
                <div className="flex flex-col gap-3 p-4">
                    {questions.length > 1 ? (
                        questions
                        .slice(1)
                        .map((q: Question) => (
                            <div
                             key={q.id}
                             className="p-3 border w-[360px] rounded-lg flex justify-between">
                                <p className="truncate">{q.label}</p>
                                <Button
                                 size="sm"
                                 onClick={() => handleOpenQuestion(q)}>
                                    <FontAwesomeIcon icon={Icons.arrowRight}/>
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p>Aucune question pour ce projet.</p>
                    )}
                </div>
            </Modal>
            {selectedQuestion && (
                <ModalQuestion
                 modal={modalResponse}
                 question={selectedQuestion.label || "Question"}
                 questionId={selectedQuestion.id?.toString() || "id"}
                 onValidate={() => modalResponse.closeModal()}
                 onSkip={() => modalResponse.closeModal()}
                >
                    {React.createElement(getResponseForm(selectedQuestion))}
                </ModalQuestion>
            )}
        </div>
    );
}