"use client";

import { PageHeader, Card } from "@/components/ui";

import { ReactFlow, ControlButton, Controls, ControlPosition} from "@xyflow/react"
import '@xyflow/react/dist/style.css';
import { PanelsTopLeft } from "lucide-react";

export default function IdeationPage() {
    const initialNodes = [
        {
            id: 'n1',
            position: {x: 570, y: 0},
            data: {label: 'Question 1 ?'},
            type: 'input',
        },
        {
            id: 'n2',
            position: {x: 470, y: 100},
            data: {label: 'Question 2 ?'},
        },
        {
            id: 'n3',
            position: {x: 700, y: 100},
            data: {label: 'Question 3 ?'},
        },
        {
            id: 'n4',
            position: {x: 370, y: 200},
            data: {label: 'Question 4 ?'},
        },
        {
            id: 'n5',
            position: {x: 600, y: 200},
            data: {label: 'Question 5 ?'},
        },
        {
            id: 'n6',
            position: {x: 800, y: 200},
            data: {label: 'Question 6 ?'},
        },
    ];

    const initialEdges = [
        {
            id: 'n1-n2',
            source: 'n1',
            target: 'n2',
            type: 'step',
        },
        {
            id: 'n1-n3',
            source: 'n1',
            target: 'n3',
            type: 'step',
        },
        {
            id: 'n2-n4',
            source: 'n2',
            target: 'n4',
            type: 'step',
        },
        {
            id: 'n3-n5',
            source: 'n3',
            target: 'n5',
            type: 'step',
        },
        {
            id: 'n3-n6',
            source: 'n3',
            target: 'n6',
            type: 'step',
        },
    ];

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Projet Lambda - IDEATION" description="Dans cette étape, vous pouvez rassembler vos idées, définir les besoins principaux et commencer à poser les bases de votre projet en répondant aux questions."/>
            <section className="flex flex-1 flex-col items-center">
                <div className="h-fit z-10">
                    <Card
                    color="#9CCA95"
                    title="Synthèse des projets"
                    progress={30}/>                    
                </div>


                 <div className="flex rounded-xl flex-col m-5 mt-0 bg-light flex-1 w-[80%] items-center justify-center">
                    <ReactFlow
                     nodes={initialNodes}
                     edges={initialEdges}>
                        <Controls position="bottom-center" orientation="horizontal" showInteractive={false}/>
                        
                    </ReactFlow>
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