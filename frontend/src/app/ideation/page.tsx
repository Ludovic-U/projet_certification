"use client";

import { PageHeader, Card } from "@/components/ui";

export default function IdeationPage() {
    return (
        <div className="h-full">
            <PageHeader title="Projet Lambda - IDEATION" description="Dans cette étape, vous pouvez rassembler vos idées, définir les besoins principaux et commencer à poser les bases de votre projet en répondant aux questions."/>
            <section className="flex flex-col items-center">
                <Card
                 title="Proposition de valeurs"
                 progress={0}/>

                 <div>
                    TREE
                 </div>
            </section>
        </div>
    );
}