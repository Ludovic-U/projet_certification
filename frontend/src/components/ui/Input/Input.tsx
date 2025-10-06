"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/utils/utils";
import { inputVariants, InputProps, LoadingSpinner } from "@/components/ui";

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = "text",
            variant,
            label,
            labelBg,
            error,
            helperText,
            leftIcon,
            rightIcon,
            loading = false,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const generateId = useId();
        const inputId = id || generateId;

        const effectiveVariant = error ? "error" : variant;
        const isDisabled = disabled || loading;

        return (
    <div>
            <div className="relative">
                {label && (
                    <div className="absolute z-20 -top-3.5 left-3">
                    <div className={cn(
                        "absolute h-0.5 w-full top-3/5",
                        labelBg ?? "bg-light"
                    )}/>
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "relative px-1 text-greydarker font-didact text-sm",
                            labelBg ?? "bg-light"
                        )}
                    >
                        {props.required && (
                            <span className="text-alertdanger mr-1 font-bold text-xl">
                                *
                            </span>
                        )}
                        {label}
                    </label>
                    </div>
                )}

                    <input
                        type={type}
                        autoComplete="off"
                        spellCheck="false"
                        autoCorrect="off"
                        className={cn(
                            inputVariants({ variant: effectiveVariant }),
                            leftIcon && "pl-10",
                            (rightIcon || loading) && "pr-10",
                            className
                        )}
                        ref={ref}
                        id={inputId}
                        disabled={isDisabled}
                        aria-invalid={!!error}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : helperText
                                ? `${inputId}-helper`
                                : undefined
                        }
                        {...props}
                    />

                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-grey">
                            {leftIcon}
                        </div>
                    )}

                    {(rightIcon || loading) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-grey">
                            {loading ? <LoadingSpinner /> : rightIcon}
                        </div>
                    )}
</div>

                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="m-2 text-base text-alertdanger font-didact cursor-default"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p
                        id={`${inputId}-helper`}
                        className="mt-2 text-base font-didact text-dark cursor-default"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
