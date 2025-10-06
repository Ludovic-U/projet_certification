import React, {useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ModalProps } from "./modal.types";
import { useModalBehavior } from "@/hooks/useModalBehavior";

import { FontAwesomeIcon, Icons } from "@/lib/icons"
import { Button } from "@/components/ui";

const Modal: React.FC<ModalProps> = ({
    modal,
    title,
    description,
    children,
    className,
}) => {
    const modalRef = useModalBehavior(modal.isOpen, modal.closeModal);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Gestion du click en dehors du modal
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            modal.closeModal();
        }
    };

    if (!modal.isOpen) return null

    const modalContent = (
        <div
         className="fixed select-none inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ease-out"
          onClick={handleBackdropClick}>
            <div className="relative bg-light rounded-xl text-dark flex flex-col shadow-500base px-8 py-4">
                
                <Button
                 className="absolute top-2 right-2"
                 size="iconS"
                 variant="secondary"
                 onClick={modal.closeModal}>
                    <FontAwesomeIcon icon={Icons.xmark}/>
                </Button>

                {/* Header */}
                <div className="flex flex-col items-center">
                    <h2 className="uppercase font-oswald text-2xl wrap-anywhere">{title}</h2>
                    {description && <p className="font-didact text-greydarker text-lg">{description}</p>}
                </div>
                
                {/* Contenu */}
                <div className="mt-8 flex flex-col items-center">
                    {children}
                </div>               
            </div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

export default Modal;
export { Modal };