"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/utils/utils";

import {
    checkboxVariants,
    checkboxBoxVariants,
    CheckboxProps
} from "@/components/ui";

import { FontAwesomeIcon, Icons } from "@/lib/icons"

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            className,
            size,
            label,
            error,
            helperText,
            id,
            disabled,
            checked,
            onCheckedChange,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
            props.onChange?.(e);
        };

        return (
            <div className="w-full">
                <label
                    htmlFor={inputId}
                    className={cn(checkboxVariants({ size }), className)}
                >
                    <input
                        type="checkbox"
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        checked={checked}
                        onChange={handleChange}
                        aria-invalid={!!error}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : helperText
                                ? `${inputId}-helper`
                                : undefined
                        }
                        className="sr-only peer"
                        {...props}
                    />

                    <div className={checkboxBoxVariants({ size })}>
                        <FontAwesomeIcon
                            icon={Icons.check}
                            className="text-light"
                        />
                    </div>

                    {label && (
                        <span
                            className="whitespace-nowrap peer-aria-invalid:text-alertdanger
                                    peer-disabled:cursor-default peer-disabled:opacity-50"
                        >
                            {label}
                        </span>
                    )}
                </label>

                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1 text-sm text-alertdanger"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p
                        id={`${inputId}-helper`}
                        className="mt-1 text-sm text-dark"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";
