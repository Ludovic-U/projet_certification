"use client";

import { PageHeader, Button, Card, Table } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { useLocalStorage } from "@/context/LocalStorageContext";
import { useState, useEffect } from "react";
import type { Column } from "@/components/ui/Table/table.types";
import { useConfig } from "@/context/ConfigContext";
import api_backend from "@/api/axiosInstance";

export default function VueEnsemblePage() {
    const router = useRouter();
    const { data } = useLocalStorage();
    const { config } = useConfig();

    // Progress placeholders (à remplacer par des calculs réels plus tard)
    const [ideationProgress, setIdeationProgress] = useState(0);
    const [ideationMax, setIdeationMax] = useState(0);
    const conceptionProgress = 0;
    const pilotageProgress = 0;
    const evaluationProgress = 0;
    const reportingProgress = 0;

    // Todo list state
    const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean; assignedTo?: number; assignedToName?: string; deadline?: string }[]>([]);
    const [newTodoText, setNewTodoText] = useState("");
    const [newTodoAssignedTo, setNewTodoAssignedTo] = useState<number | undefined>(undefined);
    const [newTodoDeadline, setNewTodoDeadline] = useState("");
    const [users, setUsers] = useState<{ userId: number; firstname: string; lastname: string }[]>([]);
    const [showAddTodoForm, setShowAddTodoForm] = useState(false);

    const params = useParams();

    useEffect(() => {
        if (!params.projectId) return;

        const fetchIdeationProgress = async () => {
            try {
                const projectId = Number(params.projectId);
                const [questionsRes, responsesRes, swotRes] = await Promise.all([
                    api_backend.get(`/question/get/project/${projectId}`),
                    api_backend.get(`/response/get/project/${projectId}`),
                    api_backend.get(`/project/${projectId}/swot`),
                ]);

                const questions = Array.isArray(questionsRes.data)
                    ? questionsRes.data
                    : [];
                const responses = Array.isArray(responsesRes.data)
                    ? responsesRes.data
                    : [];

                const getQuestionCategoryLabel = (question: { category?: string | { toString(): string } }) => {
                    if (typeof question?.category === "string") {
                        return question.category;
                    }
                    return "";
                };

                const nonThemeQuestions = questions.filter((question: { category?: string | { toString(): string } }) =>
                    getQuestionCategoryLabel(question).trim().toLowerCase() !== "theme"
                );

                const nonThemeQuestionIds = new Set<number>(
                    nonThemeQuestions
                        .map((question: { questionId?: number; id?: number }) => Number(question.questionId ?? question.id))
                        .filter((questionId: number) => Number.isInteger(questionId))
                );

                const answeredQuestionIds = new Set<number>(
                    responses
                        .map((response: { questionId?: number }) => Number(response.questionId))
                        .filter(
                            (questionId: number) =>
                                Number.isInteger(questionId) && nonThemeQuestionIds.has(questionId)
                        )
                );

                const totalQuestions = nonThemeQuestions.length;
                const answeredQuestions = answeredQuestionIds.size;

                const swot = swotRes.data || {};
                const swotFields = [
                    swot.SWOT_strength,
                    swot.SWOT_weakness,
                    swot.SWOT_opportunity,
                    swot.SWOT_threat,
                ];
                const swotCompleted = swotFields.filter(
                    (value) => typeof value === "string" && value.trim() !== ""
                ).length;

                const totalItems = totalQuestions + swotFields.length;
                const completedItems = answeredQuestions + swotCompleted;
                setIdeationProgress(completedItems);
                setIdeationMax(totalItems);
            } catch (error) {
                console.error("Erreur lors du chargement de l'avancement ideation:", error);
                setIdeationProgress(0);
                setIdeationMax(0);
            }
        };

        fetchIdeationProgress();
    }, [params.projectId]);

    // Fetch users by client
    useEffect(() => {
        if (params.clientId) {
            api_backend.get(`/user/by-client/${params.clientId}`)
                .then(res => setUsers(res.data))
                .catch(err => console.error("Error fetching users:", err));
        }
    }, [params.clientId]);

    // Fetch todos for the project
    useEffect(() => {
        if (params.projectId) {
            api_backend.get(`/todo/project/${params.projectId}`)
                .then(res => setTodos(res.data))
                .catch(err => console.error("Error fetching todos:", err));
        }
    }, [params.projectId]);

    const addTodo = () => {
        if (newTodoText.trim() && params.projectId) {
            const todoData = {
                text: newTodoText,
                projectId: Number(params.projectId),
                assignedTo: newTodoAssignedTo,
                deadline: newTodoDeadline || undefined,
            };

            api_backend.post('/todo/create', todoData)
                .then(res => {
                    setTodos([res.data, ...todos]);
                    setNewTodoText("");
                    setNewTodoAssignedTo(undefined);
                    setNewTodoDeadline("");
                    setShowAddTodoForm(false);
                })
                .catch(err => console.error("Error creating todo:", err));
        }
    };

    const toggleTodo = (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        api_backend.put(`/todo/${id}`, { completed: !todo.completed })
            .then(res => {
                setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
            })
            .catch(err => console.error("Error updating todo:", err));
    };

    const deleteTodo = (id: number) => {
        api_backend.delete(`/todo/${id}`)
            .then(() => {
                setTodos(todos.filter(todo => todo.id !== id));
            })
            .catch(err => console.error("Error deleting todo:", err));
    };

    // Colonnes pour la Table des todos
    const todoColumns: Column<{ id: number; text: string; completed: boolean; assignedTo?: number; assignedToName?: string; deadline?: string }>[] = [
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
            label: "",
            render: (todo) => (
                <div className="flex flex-col gap-0.5">
                    <span className={`${todo.completed ? 'line-through text-grey' : 'text-greydarker'}`}>
                        {todo.text}
                    </span>
                    {(todo.assignedToName || todo.deadline) && (
                        <div className="flex gap-2 text-xs text-grey">
                            {todo.assignedToName && <span>👤 {todo.assignedToName}</span>}
                            {todo.deadline && <span>📅 {new Date(todo.deadline).toLocaleDateString()}</span>}
                        </div>
                    )}
                </div>
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

    const cards = [
        {
            title: "IDEATION",
            description: "Générer et structurer les idées initiales.",
            progress: ideationProgress,
            max: ideationMax,
            showPercent: false,
            color: "#D4B2A7",
            path: (p: any) => `/${p.clientId}/${p.projectId}/ideation`
        },
        {
            title: "CONCEPTION",
            description: "Définir et planifier les solutions.",
            progress: conceptionProgress,
            color: "#B49186",
            path: (p: any) => `/${p.clientId}/${p.projectId}/conception`
        },
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
            path: (p: any) => `/${p.clientId}/${p.projectId}/reporting`
        },
        {
            title: "REPORTING",
            description: "Analyser les résultats et partager les bilans.",
            progress: reportingProgress,
            color: "#605049",
            path: (p: any) => `/${p.clientId}/${p.projectId}/reporting`
        }
    ];

    const firstIncompleteIndex = cards.findIndex((card) => {
        const targetMax = typeof card.max === "number" && card.max > 0 ? card.max : 100;
        return card.progress < targetMax;
    });

    return (
        <div className="h-full flex flex-col">
            <PageHeader title={"Projet " + (data?.projectName ?? "")} description={config?.subtitles.overview} helpKey="overview"/>
            <section className="flex-1 flex flex-col items-center justify-evenly">
                 {/* ------------------------TODO list + Aperçu action
                 -------------------------------- */}

                {/* <div className="hidden md:flex gap-6 w-full max-w-6xl mb-8">
                    <div className="flex-1 bg-white rounded-xl p-6">
                        <div className="flex flex-col gap-3 h-full">
                            <div className="flex items-center justify-between">
                                <h2 className="font-oswald text-primary text-2xl">Todo list</h2>
                                <Button 
                                    size="sm" 
                                    variant="primary"
                                    onClick={() => setShowAddTodoForm(!showAddTodoForm)}
                                    className="text-sm py-1 px-3"
                                >
                                    {showAddTodoForm ? "Annuler" : "+ Ajouter"}
                                </Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto max-h-100 flex flex-col gap-3">
                                {showAddTodoForm && (
                                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <input
                                            type="text"
                                            value={newTodoText}
                                            onChange={(e) => setNewTodoText(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addTodo()}
                                            placeholder="Nouvelle tâche..."
                                            className="w-full px-3 py-1.5 text-sm border border-grey rounded-lg focus:outline-none focus:border-primary"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                value={newTodoAssignedTo || ""}
                                                onChange={(e) => setNewTodoAssignedTo(e.target.value ? Number(e.target.value) : undefined)}
                                                className="flex-1 px-3 py-1.5 text-sm border border-grey rounded-lg focus:outline-none focus:border-primary"
                                            >
                                                <option value="">Non assigné</option>
                                                {users.map(user => (
                                                    <option key={user.userId} value={user.userId}>
                                                        {user.firstname} {user.lastname}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="date"
                                                value={newTodoDeadline}
                                                onChange={(e) => setNewTodoDeadline(e.target.value)}
                                                className="flex-1 px-3 py-1.5 text-sm border border-grey rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <Button 
                                            size="sm" 
                                            onClick={addTodo}
                                            className="self-end"
                                        >
                                            Ajouter la tâche
                                        </Button>
                                    </div>
                                )}

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

                    <div className="flex-2 bg-white rounded-xl p-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-oswald text-primary text-2xl">Aperçu des actions</h2>
                            <p className="font-noto text-greydarker text-sm">Aucune action ou échéance actuellement planifiée.</p>
                        </div>
                    </div>
                </div> */}
 {/* -------------------------Etapes workflow-------------------------------- */}
                                <div className="flex flex-col items-center gap-8 w-full">                 

                    {cards.map((card, index) => (
                        <div key={card.title} className="relative w-full max-w-2xl rounded-xl">
                            {index === firstIncompleteIndex && (
                                <span className="absolute inset-1 rounded-xl border border-dark/80 animate-[ping_1.4s_cubic-bezier(0,0,1,1)_infinite] pointer-events-none"></span>
                            )}
                            <Card
                              title={card.title}
                              description={card.description}
                              buttonLabel="Ouvrir"
                              color={card.color}
                              progress={card.progress}
                              max={card.max}
                              showPercent={card.showPercent}
                              className={`w-full min-h-48 [&_h3]:text-3xl [&_p]:text-lg ${
                                  index === firstIncompleteIndex ? "border-2 border-dark" : ""
                              }`}
                              onButtonClick={() => router.push(card.path(params))}
                            />
                        </div>
                    ))}
                </div>

                
            </section>
        </div>
    );
}