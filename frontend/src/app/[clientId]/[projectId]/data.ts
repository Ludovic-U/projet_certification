export function getData() {
    const tasks = [
        {
            id: 1,
            start: new Date(2025, 9, 19),
            end: new Date(2025, 9, 25),
            text: "Planification",
            progress: 100,
            parent: 0,
            type: "task",
            details: "Planifier le projet",
            to: 1,
        },
        {
            id: 2,
            start: new Date(2025, 9, 26),
            end: new Date(2025, 10, 2),
            text: "Développement",
            progress: 50,
            parent: 0,
            type: "summary",
            open: true,
            details: "Développer les fonctionnalités",
        },
        {
            id: 21,
            start: new Date(2025, 9, 26),
            end: new Date(2025, 9, 29),
            text: "Frontend",
            progress: 100,
            parent: 2,
            type: "task",
            details: "Développer l'interface utilisateur",
            to: 1,
        },
        {
            id: 22,
            start: new Date(2025, 9, 30),
            end: new Date(2025, 10, 2),
            text: "Backend",
            progress: 0,
            parent: 2,
            type: "task",
            details: "Développer la logique serveur",
            to: 2,
        },
        {
            id: 3,
            start: new Date(2025, 10, 3),
            end: new Date(2025, 10, 10),
            text: "Test",
            progress: 0,
            parent: 0,
            type: "task",
            details: "Tester le produit",
            to: 2,
        },
        {
            id: 4,
            start: new Date(2025, 10, 11),
            end: new Date(2025, 10, 15),
            text: "Déploiement",
            progress: 0,
            parent: 0,
            type: "task",
            details: "Déployer en production",
            to: 1,
        },
        {
            id: 5,
            start: new Date(2025, 10, 15),
            end: new Date(2025, 10, 15),
            text: "Projet Terminé",
            progress: 0,
            parent: 0,
            type: "milestone",
            details: "Fin du projet",
        },
    ];

    const links = [
        { id: 1, source: 1, target: 21, type: "e2s" },
        { id: 2, source: 21, target: 22, type: "e2s" },
        { id: 3, source: 22, target: 3, type: "e2s" },
        { id: 4, source: 3, target: 4, type: "e2s" },
        { id: 5, source: 4, target: 5, type: "e2s" },
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
}