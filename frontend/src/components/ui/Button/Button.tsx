"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/utils";

import { buttonVariants, ButtonProps, LoadingSpinner } from "@/components/ui";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            type = "button",
            size,
            variant,
            asChild = false,
            loading = false,
            children,
            disabled,
            icon,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        const isDisabled = loading || disabled;

        return (
            <Comp
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                type={asChild ? undefined : type}
                disabled={asChild ? undefined : isDisabled}
                aria-disabled={isDisabled}
                aria-busy={loading}
                {...props}
            >
                {loading && (
                    <>
                        <LoadingSpinner />
                        <span className="sr-only">Chargement ...</span>
                    </>
                )}
                {icon && <span className="size=4">{icon}</span>}
                {children}
            </Comp>
        );
    }
);

Button.displayName = "Button";
