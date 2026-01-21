// "use client";

// import { PageHeader } from "@/components/ui";
// import { useConfig } from "@/context/ConfigContext";
// import { Gantt, Willow } from "@svar-ui/react-gantt";
// import "@svar-ui/react-gantt/all.css";

// export default function ConceptionPage() {
//     const { config } =  useConfig();

//     // Données d'exemple pour le diagramme de Gantt
//     const tasks = [
//         {
//             id: 47,
//             text: "[1] Projet principal",
//             start: new Date(2024, 5, 12),
//             end: new Date(2024, 7, 12),
//             duration: 8,
//             progress: 0,
//             parent: 0,
//             type: "summary",
//         },
//         {
//             id: 22,
//             text: "Conception",
//             start: new Date(2024, 7, 11),
//             end: new Date(2024, 8, 12),
//             duration: 8,
//             progress: 0,
//             parent: 47,
//             type: "task",
//         },
//         {
//             id: 20,
//             text: "Développement",
//             start: new Date(2024, 5, 11),
//             end: new Date(2024, 6, 12),
//             duration: 1,
//             progress: 2,
//             type: "task",
//             lazy: false,
//         },
//         {
//             id: 21,
//             text: "Tests",
//             start: new Date(2024, 7, 10),
//             end: new Date(2024, 8, 12),
//             duration: 3,
//             progress: 0,
//             type: "task",
//             lazy: false,
//         },
//     ];

//     const links = [
//         { id: 1, source: 20, target: 21, type: "e2e" }
//     ];

//     const scales = [
//         { unit: "month", step: 1, format: "MMMM yyy" },
//         { unit: "day", step: 1, format: "d" },
//     ];

//     return (
//         <div className="h-full flex flex-col">
//             <PageHeader title="Titre" description={config?.subtitles.conception}/>
//             <section className="flex-1 p-4">
//                 <Willow>
//                     <Gantt tasks={tasks} links={links} scales={scales} />
//                 </Willow>
//             </section>
//         </div>
//     );
// }