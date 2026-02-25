import { useCallback, useEffect, useState } from "react";
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
    types?: (number | { typeId: number; label: string })[];
    projects?: number[];
}

type UseProjectQuestionOptions = {
    mode?: "project" | "all";
    pageSize?: number;
};

export function useProjectQuestion(
    projectId?: number,
    options?: UseProjectQuestionOptions
) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mode = options?.mode ?? "project";
    const pageSize = options?.pageSize ?? 1000;

    const fetchQuestions = useCallback(async () => {
        if (mode === "project" && (!projectId || projectId <= 0)) {
            setQuestions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res =
                mode === "all"
                    ? await api_backend.get(`/question/get?page=1&limit=${pageSize}`)
                    : await api_backend.get(`/question/get/project/${projectId}`);

            const rawData = mode === "all" ? res.data?.data : res.data;
            console.log("Questions récupérées:", rawData);
            const questionBase = Array.isArray(rawData) ? rawData : [];

            // Map les questions avec les options déjà présentes dans la réponse
            const questionsWithOptions = questionBase.map((q: any) => ({
                id: q.questionId,
                questionId: q.questionId,
                label: q.label,
                keyword: q.keyword,
                parentId: q.questionIdParent ?? null,
                answered: false,
                status: "pending" as const,
                category: q.category ?? "",
                onglet: q.onglet ?? "analyse_existant",
                numberOfSelectionableOpt: q.numberOfSelectionableOpt,
                options: (q.options || []).map((opt: any) => opt.label),
                types: q.types || [],
                projects: q.projects || []
            }));

            console.log("Questions formatées:", questionsWithOptions);
            setQuestions(questionsWithOptions);
        } catch (err: any) {
            console.error("Erreur lors de la récupération des questions:", err);
            setError(err.message || "Erreur lors de la récupération des questions");
        } finally {
            setLoading(false);
        }
    }, [mode, pageSize, projectId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    return { questions, loading, error, refetch: fetchQuestions };
}