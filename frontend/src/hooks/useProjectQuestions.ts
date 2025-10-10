import { useEffect, useState } from "react";
import axios from "axios";
import { Question } from "@/types/question";

export function useProjectQuestion(projectId: number) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const res = await axios.get(`/api/questions/get/project/${projectId}`);
                setQuestions(res.data) // data est un tableau de questions
            } catch (err: any) {
                console.error(err)
                setError(err.message || "Erreur lors de la récupération des questions");
            } finally {
                setLoading(false);
            }
        }
        if (projectId) fetchQuestions();
    }, [projectId]);

    return { questions, loading, error };
}