import React, { useEffect, useRef} from "react";
import { createPortal } from "react-dom";
import { useModalBehavior } from "@/hooks/useModalBehavior";
import { ModalQuestionProps } from "./modal.types";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { Button } from "../Button";

const ModalQuestion : React.FC<ModalQuestionProps> = ({
    modal,
    questionId,
    question,
    children,
    className,
    onValidate,
    onSkip,
}) => {
    const modalRef = useModalBehavior(modal.isOpen, modal.closeModal);

    // Ferme le modal si clique sur l'arrière plan
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            modal.closeModal();
        }
    };

    // Validation du formulaire
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        console.log("Réponses :", Object.fromEntries(formData.entries()));

        if (onValidate) onValidate();

        modal.closeModal();
    };

    //  Si modal fermé, rien à afficher (sécurité éviter rendu du DOM inutile)
    if (!modal.isOpen) return null

    const modalQuestionContent = (
        <div
         className="fixed select-none inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-200 ease-out"
         onClick={handleBackdropClick}>
            <div
             ref={modalRef}
             className="relative bg-light min-w-100 max-w-[80%] overflow-auto rounded-xl text-dark flex flex-col shadow-500base p-3">
                {/* Header */}
                <div className="flex items-center justify-between pl-4 mb-3">
                    <span className="font-medium text-greydarker">Question {questionId}</span>
                    <Button
                     size="iconS"
                     variant="secondary"
                     onClick={modal.closeModal}>
                        <FontAwesomeIcon icon={Icons.xmark}/>
                    </Button>
                </div>

                {/* Corps */}
                <div className="bg-white rounded-lg flex flex-col justify-between p-4">
                    <span className="font-bold text-dark">{question}</span>
                    
                    {/* Zone de réponse */}
                    <form
                     onSubmit={handleSubmit}
                     className="h-full w-full flex flex-col">
                        <div className="flex-1 my-3">
                            {children}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-end ">
                            <button
                            type="button"
                            className="underline cursor-pointer font-medium"
                            onClick={onSkip}
                            >
                                passer la question
                            </button>
                            
                            <Button
                            type="submit"
                            className="w-40 py-1">
                                Valider
                            </Button>
                        </div>
                    </form>


                </div>
            </div>
        </div>
    );
    return createPortal(modalQuestionContent, document.body)
};

export default ModalQuestion;
export { ModalQuestion }