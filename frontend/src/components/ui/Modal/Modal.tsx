import React, {useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ModalProps } from "./modal.types";

import { FontAwesomeIcon, Icons } from "@/lib/icons";

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    onConfirm,
    title,
    description,
    children,
    cancelText,
    confirmText,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Gestion de l'ouverture/fermeture du modal
    useEffect(() => {
        if (isOpen) {
            // stocke l'élément actif avant d'ouvrir le modal
            previousActiveElement.current = document.activeElement as HTMLElement;
            // Bloque le scroll du body
            document.body.style.overflow = "hidden";
            // focus sur le modal
            setTimeout(() => {
                modalRef.current?.focus()
            }, 0);
        } else {
            // restaure le scroll
            document.body.style.overflow = '';
            // Restaure le focus
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Gestion des touches du clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }

            // Gestion du focus trap (tab et shift+tab) pour que si tab dans form, last elem renvoie au premier et inversement
            if (event.key === 'Tab') {
                const modal = modalRef.current;
                if (!modal) return;

                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Gestion du click en dehors du modal
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
    if (!isOpen) return null

    const modalContent = (
        <div
         className="">

        </div>
    )

}