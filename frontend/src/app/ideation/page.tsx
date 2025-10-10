"use client";

import React, { useState } from "react";
import { Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css"
import { Question } from "@/types/question";
import { PageHeader, Card } from "@/components/ui";
import TreeView from "@/components/ui/Tree/TreeView";
import { useProjectQuestion } from "@/hooks/useProjectQuestions";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { LoadingSpinner } from "@/components/ui";

export default function IdeationPage() {
    const projectId = 1; // récupéré dynamiquement selon le projet courant
    const { questions, loading } = useProjectQuestion(projectId);
    const [nodesState, setNodesState] = useState<Node[]>([]);

    const progress = nodesState.filter(
        (n) => n.data?.status === "answered" || n.data?.status === "skipped"
    ).length;

    const maxQuestions = nodesState.length || questions.length;

    if (loading) return <div className="flex">Chargement des questions...<LoadingSpinner/></div>

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
                    buttonLabel="voir toutes les questions"/>
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
        </div>
    );
}