"use client";

import { PageHeader, Button, Card, Table } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { useLocalStorage } from "@/context/LocalStorageContext";
import { useState } from "react";
import type { Column } from "@/components/ui/Table/table.types";
import { useConfig } from "@/context/ConfigContext";

export default function VueEnsemblePage() {
    const router = useRouter();
    const { data, setItem, removeItem } = useLocalStorage();
    const { config } = useConfig();

    // Progress placeholders (à remplacer par des calculs réels plus tard)
    const ideationProgress = 0;
    const conceptionProgress = 20;
    const [skip, setSkip] = useState(0);
    const pilotageProgress = 60;
    const evaluationProgress = 20;
    const reportingProgress = 20;

    // Todo list state
    const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>([]);
    const [newTodoText, setNewTodoText] = useState("");

    const addTodo = () => {
        if (newTodoText.trim()) {
            setTodos([...todos, { id: Date.now(), text: newTodoText, completed: false }]);
            setNewTodoText("");
        }
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    // Colonnes pour la Table des todos
    const todoColumns: Column<{ id: number; text: string; completed: boolean }>[] = [
        {
            key: "completed",
            label: "",
            className: "w-12",
            render: (todo) => (
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => {
                        e.stopPropagation();
                        toggleTodo(todo.id);
                    }}
                    className="w-5 h-5 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                />
            )
        },
        {
            key: "text",
            label: "Tâche",
            render: (todo) => (
                <span className={`${todo.completed ? 'line-through text-grey' : 'text-greydarker'}`}>
                    {todo.text}
                </span>
            )
        },
        {
            key: "actions",
            label: "",
            className: "w-12",
            render: (todo) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                    }}
                    className="text-alertdanger hover:text-red-700 transition"
                >
                    ✕
                </button>
            )
        }
    ];

    // Condition: tant que la somme n'atteint pas 200, afficher IDEATION + CONCEPTION uniquement
    const showIdeationConception = (ideationProgress + conceptionProgress + skip) < 200;

    const cards = showIdeationConception
        ? [ // if true
            {
                title: "IDEATION",
                description: "Générer et structurer les idées initiales.",
                progress: ideationProgress,
                color: "#D4B2A7",
                path: (p: any) => `/${p.clientId}/${p.projectId}/ideation`
            },
            {
                title: "CONCEPTION",
                description: "Définir et planifier les solutions.",
                progress: conceptionProgress,
                color: "#B49186",
                path: (p: any) => `/${p.clientId}/${p.projectId}/conception`
            }
        ]
        : [ // else
            {
                title: "PILOTAGE",
                description: "Suivre l'avancement et coordonner l'équipe.",
                progress: pilotageProgress,
                color: "#96776E",
                path: (p: any) => `/${p.clientId}/${p.projectId}/pilotage`
            },
            {
                title: "EVALUATION",
                description: "Analyser les résultats et partager les bilans.",
                progress: evaluationProgress,
                color: "#605049",
                path: (p: any) => `/${p.clientId}/${p.projectId}/reporting` // Suppose same route regroupe bilan
            },
            {
                title: "REPORTING",
                description: "Analyser les résultats et partager les bilans.",
                progress: reportingProgress,
                color: "#605049",
                path: (p: any) => `/${p.clientId}/${p.projectId}/reporting`
            }
        ];

    const params = useParams();

    return (
        <div className="h-full flex flex-col">
            <PageHeader title={"Projet " + (data?.projectName ?? "")} description={config?.subtitles.overview}/>
            <section className="flex-1 flex flex-col items-center justify-evenly">
                 {/* -------------------------Aperçu action-------------------------------- */}

                <div className="hidden md:flex gap-6 w-full max-w-6xl">
                    <div className="flex-2 bg-white rounded-xl p-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-oswald text-primary text-2xl">Aperçu des actions</h2>
                            <p className="font-noto text-greydarker text-sm">Aucune action ou échéance actuellement planifiée.</p>
                        </div>
                    </div>
                     {/* ------------------------TODO list-------------------------------- */}

                    <div className="flex-1 bg-white rounded-xl p-6">
                        <div className="flex flex-col gap-3 h-full">
                            <div className="flex items-center justify-between">
                                <h2 className="font-oswald text-primary text-2xl">Todo list</h2>
                                <Button 
                                    size="sm" 
                                    variant="primary"
                                    onClick={addTodo}
                                    className="text-sm py-1 px-3"
                                >
                                    + Ajouter   
                                </Button>
                            </div>
                            
                            <input
                                type="text"
                                value={newTodoText}
                                onChange={(e) => setNewTodoText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                                placeholder="Nouvelle tâche..."
                                className="w-full px-3 py-1.5 text-sm border border-grey rounded-lg focus:outline-none focus:border-primary"
                            />

                            <div className="flex-1 overflow-y-auto max-h-100">
                                {todos.length === 0 ? (
                                    <p className="font-noto text-greydarker text-sm mt-2">Aucune tâche pour le moment.</p>
                                ) : (
                                    <Table
                                        data={todos}
                                        columns={todoColumns}
                                        onRowClick={(todo) => toggleTodo(todo.id)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
 {/* -------------------------Etapes workflow-------------------------------- */}
                <div className="flex flex-col md:flex-row items-center gap-8 relative">                 

                    {cards.map(card => (
                        <Card
                          key={card.title}
                          title={card.title}
                          description={card.description}
                          buttonLabel="Ouvrir"
                          color={card.color}
                          progress={card.progress}
                          onButtonClick={() => router.push(card.path(params))}
                        />
                    ))}
                    
                    {showIdeationConception && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-[calc(100%+2rem)]"
                          onClick={() => setSkip(200)}
                        >
                            Passer aux étapes suivantes
                        </Button>
                    )}
                    {!showIdeationConception && (
                        <Button
                          variant="secondary"
                          size="sm"
                            className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-[calc(100%+2rem)]"
                          onClick={() => setSkip(0)}
                        >
                            Retour
                        </Button>
                    )}
                </div>

                
            </section>
        </div>
    );
}