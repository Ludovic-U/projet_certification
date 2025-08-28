"use client";

import { forwardRef, use, useId } from "react";
import { cn } from "@/utils/utils";
import { radioVariants } from "./radio_variants";
import { RadioProps } from "./radio_types";
import { useRadioGroup } from "./RadioGroup";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    (
        {
            className,
            size,
            label,
            error,
            helperText,
            id,
            disabled,
            value,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        const radioGroup = useRadioGroup();

        const checked = radioGroup.value === value;

        const handleChange = () => {
            if (!disabled) radioGroup.setValue(value);
        };

        return (
            <div className="w-full">
                <label
                 htmlFor={inputId}
                 className={cn("inline-flex items-center gap-2 cursor-pointer font-noto text-base", className)}
                >

                    <input
                     type="radio"
                     id={inputId}
                     name={radioGroup.name}
                     value={value}
                     checked={checked}
                     disabled={disabled}
                     onChange={handleChange}
                     aria-invalid={!!error}
                     aria-describedby={
                        error
                        ? `$(inputId)-error`
                        : helperText
                        ? `${inputId}-helper`
                        : undefined
                     }
                     className="sr-only peer"
                     ref={ref}
                     {...props}
                    />

                    <div className={cn(radioVariants({size}), "relative")}>
                        <div
                         className={cn(
                            "w-2 h-2 rounded-full",
                            "peer-checked:bg-current"
                         )}
                        />
                    </div>

                    {label && (
                        <span
                         className="peer-aria-invalid:text-alertdanger
                                    peer-disabled:cursor-default peer-disabled:opacity-50"
                        >
                            {label}
                        </span>
                    )}
                </label>

                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-alertdanger" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="mt-1 text-sm text-dark">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Radio.displayName = "Radio";