import { ReactNode } from "react";
import { useModal } from "@/hooks"

export interface ModalQuestionProps {
    // contrôle l'affichage du modal
    modal: ReturnType<typeof useModal>;
    questionId: string;
    question: string;
    children: ReactNode;
    className?: string;
}