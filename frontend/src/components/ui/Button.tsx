"use client"

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button.variants";
import { ButtonProps } from "./button.types";

const LoadingSpinner = () => (
    <svg
     className="animate-spin size-4 shrink-0"
     xmlns="http://www.w3.org/2000/svg"
     fill="none"
     viewBox="0 0 24 24"
     aria-hidden="true"
     role="status">
        <circle
         className="opacity-25"
         cx="12"
         cy="12"
         r="10"
         stroke="currentColor"
         strokeWidth="4"/>
        <path
         className="opacity-75"
         fill="currentColor"
         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            children,
            disabled,
            type = "button",
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button"
        const isDisabled = loading || disabled

        return (
            <Comp
             className={cn(buttonVariants({ variant, size }), className)}
             ref = {ref}
             type ={asChild ? undefined : type}
             disabled={asChild ? undefined : isDisabled}
             aria-disabled={isDisabled}
             aria-busy={loading}
             {...props}
            >
                {loading && (
                    <>
                    <LoadingSpinner/>
                    <span className="sr-only">Chargement ...</span>
                    </>
                )}
                {children}
            </Comp>
        )
    }
)

Button.displayName = "Button"