import { ReactNode } from "react";

export interface ModalProps {
    // contrôle l'affichage du modal
    isOpen: boolean;
    // fonction appelé pour fermer le modal
    onClose: () => void;
    // fonction appelée lors du clic sur le bouton annuler
    onCancel?: () => void;
    // function appelée lors du clic sur le bouton valider
    onConfirm: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    cancelText?: string;
    confirmText?: string;
}