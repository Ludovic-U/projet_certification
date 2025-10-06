import { useEffect, useRef } from "react";

export const useModalBehavior = (isOpen: boolean, onClose: () => void) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            document.body.style.overflow = "hidden";

            setTimeout(() => modalRef.current?.focus(), 0);
        } else {
            document.body.style.overflow = "";
            previousActiveElement.current?.focus();
        }

        return () => {
            document.body.style.overflow = "";
            previousActiveElement.current?.focus();
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }

            if (event.key === "Tab") {
                const modal = modalRef.current;
                if (!modal) return;

                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusableElements[0] as HTMLElement;
                const last = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last ) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);
    
    return modalRef;
};