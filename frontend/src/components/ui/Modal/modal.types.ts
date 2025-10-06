import { ReactNode } from "react";
import { useModal } from "@/hooks"

export interface ModalProps {
    // contrôle l'affichage du modal
    modal: ReturnType<typeof useModal>;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}