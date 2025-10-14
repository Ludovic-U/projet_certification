import { useEffect, useState } from "react";
import api_backend from "@/api/axiosInstance";
import { Question } from "@/types/question";

export function useProjectQuestion(projectId: number) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const res = await api_backend.get(`/question/get`);
                const questionBase = res.data.data

                const questionsWithOptions = await Promise.all(
                    questionBase.map(async (q: any) => {
                        const resOpt = await api_backend.get(`/question/get/${q.questionId}`);
                        return {
                            id: q.questionId,
                            label: q.label,
                            parentId: q.questionIdParent ?? null,
                            answered: false,
                            status: "pending",
                            category: q.category,
                            numberOfSelectionableOpt: q.numberOfSelectionableOpt,
                            options: resOpt.data.options || [],
                            isRelevant: q.isRelevant,
                            hasMultipleOpenResponse: q.hasMultipleOpenResponse,
                            shouldMultiply: q.shouldMultiply,
                            addType: q.types || [],
                            addProject: q.projects || []
                        };
                    })
                );

                setQuestions(questionsWithOptions)
            } catch (err: any) {
                console.error(err)
                setError(err.message || "Erreur lors de la récupération des questions");
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [projectId]);

    return { questions, loading, error };
}