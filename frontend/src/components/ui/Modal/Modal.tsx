import React, {useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ModalProps } from "./modal.types";

import { FontAwesomeIcon, Icons } from "@/lib/icons"
import { Button } from "@/components/ui";

const Modal: React.FC<ModalProps> = ({
    modal,
    title,
    description,
    children,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Gestion de l'ouverture/fermeture du modal
    useEffect(() => {
        if (modal.isOpen) {
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
    }, [modal.isOpen]);

    // Gestion des touches du clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!modal.isOpen) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                modal.closeModal();
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
    }, [modal.isOpen, modal.closeModal]);

    // Gestion du click en dehors du modal
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            modal.closeModal();
        }
    };

    if (!modal.isOpen) return null

    const modalContent = (
        <div
         className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ease-out"
          onClick={handleBackdropClick}>
            <div className="bg-light rounded-xl text-dark flex flex-col shadow-500base">
                
                {/* Header */}
                <div className="flex flex-col px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-oswald text-2xl">{title}</h2>
                        <Button variant="secondary" size="icon"
                         onClick={modal.closeModal} aria-label="Fermer">
                            <FontAwesomeIcon icon={Icons.xmark}/>
                        </Button>
                    </div>
                    {description && <p className="font-didact text-greydarker text-lg">{description}</p>}
                </div>
                
                {/* Contenu */}
                <div className="flex-1 px-6 py-4 flex flex-col items-center">
                    {children}
                </div>               
            </div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

export default Modal;
export { Modal };