"use client";

import { PageHeader } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";
import { useMemo, useState } from "react";
import { Gantt, Willow } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

export default function ConceptionPage() {
     const { config } = useConfig();
     const [api, setApi] = useState<any>();

     // Données pour le diagramme de Gantt
     const data = useMemo(() => {
         const tasks = [
             {
                 id: 1,
                 start: new Date(2025, 9, 19),
                 end: new Date(2025, 9, 25),
                 text: "Planification & Préparation",
                 progress: 100,
                 parent: 0,
                 type: "summary",
                 open: true,
                 details: "",
             },
             {
                 id: 11,
                 start: new Date(2025, 9, 19),
                 end: new Date(2025, 9, 20),
                 text: "Définir la date",
                 progress: 100,
                 parent: 1,
                 type: "task",
                 details: "Finaliser la date et l'heure du projet",
                 to: 1,
             },
             {
                 id: 12,
                 start: new Date(2025, 9, 20),
                 end: new Date(2025, 9, 21),
                 text: "Créer la liste des invités",
                 progress: 100,
                 parent: 1,
                 type: "task",
                 details: "Établir la liste complète des participants",
                 to: 2,
             },
             {
                 id: 13,
                 start: new Date(2025, 9, 21),
                 end: new Date(2025, 9, 25),
                 text: "Envoyer les invitations",
                 progress: 80,
                 parent: 1,
                 type: "task",
                 details: "Envoyer les invitations à tous les participants",
                 to: 1,
             },
             {
                 id: 2,
                 start: new Date(2025, 9, 23),
                 end: new Date(2025, 10, 3),
                 text: "Décoration",
                 progress: 0,
                 parent: 0,
                 type: "summary",
                 open: true,
                 details: "",
             },
             {
                 id: 21,
                 start: new Date(2025, 9, 23),
                 end: new Date(2025, 9, 28),
                 text: "Acheter les décorations",
                 progress: 50,
                 parent: 2,
                 type: "task",
                 details: "Acheter tous les éléments de décoration nécessaires",
                 to: 2,
             },
             {
                 id: 22,
                 start: new Date(2025, 9, 28),
                 end: new Date(2025, 10, 3),
                 text: "Installer les décorations",
                 progress: 0,
                 parent: 2,
                 type: "task",
                 details: "Mettre en place toutes les décorations",
                 to: 1,
             },
         ];

         const links = [
             { id: 1, source: 11, target: 13, type: "e2s" },
             { id: 2, source: 12, target: 13, type: "e2s" },
             { id: 3, source: 13, target: 21, type: "e2s" },
             { id: 4, source: 21, target: 22, type: "e2s" },
         ];

         const scales = [
             { unit: "month", step: 1, format: "MMMM yyyy" },
             { unit: "day", step: 1, format: "d" },
         ];

         const users = [
             { id: 1, label: "David" },
             { id: 2, label: "Olivia" },
         ];

         return { tasks, links, scales, users };
     }, []);

     return (
         <div className="h-full flex flex-col">
             <PageHeader title="Titre" description={config?.subtitles.conception} />
             <section className="flex-1 p-4">
                 <Willow>
                     <Gantt
                         init={setApi}
                         tasks={data.tasks}
                         links={data.links}
                         scales={data.scales}
                     />
                 </Willow>
             </section>
         </div>
     );
}