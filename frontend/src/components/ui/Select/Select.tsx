"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/utils/utils"
import { selectVariants } from "./select.variants";
import { SelectProps } from "./select.types"
import { LoadingSpinner } from "../LoadingSpinner";
import { FontAwesomeIcon, Icons } from "@/lib/icons"

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            variant,
            label,
            labelBg,
            error,
            helperText,
            leftIcon,
            loading = false,
            disabled,
            id,
            options = [],
            placeholder,
            ...props
        },
        ref
    ) => {
        const generateId = useId();
        const selectId = id || generateId;

        const effectiveVariant = error ? "error" : variant;
        const isDisabled = disabled || loading;

        return (
            <div className="w-full">
                <div className="relative">
                    {label && (
                        <div className="absolute z-20 -top-3.5 left-3">
                            <div className={cn(
                                "absolute h-0.5 w-full top-3/5",
                                labelBg ?? "bg-light"
                            )}/>
                            <label
                             htmlFor={selectId}
                             className={cn(
                                "relative px-1 text-greydarker font-didact text-sm",
                                labelBg ?? "bg-light"
                             )}
                            >
                                {props.required && (
                                    <span className="text-alertdanger mr-1 font-bold">
                                        *
                                    </span>
                                )}
                                {label}
                            </label>
                        </div>
                    )}

                    <select
                     className={cn(
                        selectVariants({ variant: effectiveVariant }),
                        leftIcon && "pl-10",
                        loading && "pr-10",
                        "appearance-none pr-8",
                        className
                     )}
                     ref={ref}
                     id={selectId}
                     disabled={isDisabled}
                     aria-invalid={!!error}
                     aria-describedby={
                        error
                            ? `${selectId}-error`
                            : helperText
                            ? `${selectId}-helper`
                            : undefined
                     }
                     {...props}
                    >
                        {placeholder && (
                            <option
                             value=""
                             className="bg-lighthover"
                             disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                             className="bg-light text-dark"
                             key={typeof option === "string" ? option : option.value}
                             value={typeof option === "string" ? option : option.value}
                             disabled={typeof option === "object" && option.disabled}
                            >
                                {typeof option === "string" ? option : option.label}
                            </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grey">
                        <FontAwesomeIcon icon={Icons.chevronDown}/>
                    </span>

                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-grey pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    {loading && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-grey pointer-events-none">
                            <LoadingSpinner/>
                        </div>
                    )}
                </div>

                {error && (
                    <p
                     id={`${selectId}-error`}
                     className="m-2 text-base text-alertdanger font-didact cursor-default"
                     role="alert"
                    >
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p
                     id={`${selectId}-helper`}
                     className="mt-2 text-base font-didact text-dark cursor-default">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";