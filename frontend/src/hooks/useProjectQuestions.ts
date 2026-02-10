import { useEffect, useState } from "react";
import api_backend from "@/api/axiosInstance";
import { Question } from "@/types/question";

type QuestionStatus = "pending" | "answered" | "skipped";

interface FormattedQuestion extends Record<string, unknown> {
    id: number | string;
    questionId: number | string;
    label: string;
    keyword?: string;
    parentId: number | null;
    answered: boolean;
    status: QuestionStatus;
    category?: string;
    numberOfSelectionableOpt?: number;
    options?: string[];
    isRelevant?: boolean;
    hasMultipleOpenResponse?: boolean;
    shouldMultiply?: boolean;
    types?: (number | { typeId: number; label: string })[];
    projects?: number[];
}

export function useProjectQuestion(projectId: number) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const res = await api_backend.get(`/question/get/project/${projectId}`);
                console.log("Questions de projet récupérées:", res.data);
                const questionBase = Array.isArray(res.data) ? res.data : [];
                
                // Map les questions avec les options déjà présentes dans la réponse
                const questionsWithOptions: FormattedQuestion[] = questionBase.map((q: any) => ({
                    id: q.questionId,
                    questionId: q.questionId,
                    label: q.label,
                    keyword: q.keyword,
                    parentId: q.questionIdParent ?? null,
                    answered: false,
                    status: "pending" as QuestionStatus,
                    category: q.category,
                    numberOfSelectionableOpt: q.numberOfSelectionableOpt,
                    options: (q.options || []).map((opt: any) => opt.label),
                    isRelevant: q.isRelevant,
                    hasMultipleOpenResponse: q.hasMultipleOpenResponse,
                    shouldMultiply: q.shouldMultiply,
                    types: q.types || [],
                    projects: q.projects || []
                }));

                console.log("Questions formatées:", questionsWithOptions);
                setQuestions(questionsWithOptions as unknown as Question[]);
            } catch (err: any) {
                console.error("Erreur lors de la récupération des questions:", err);
                setError(err.message || "Erreur lors de la récupération des questions");
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [projectId]);

    return { questions, loading, error };
}