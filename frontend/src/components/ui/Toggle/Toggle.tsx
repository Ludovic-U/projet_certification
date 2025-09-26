"use client";

import * as React from "react";
import { cn } from "@/utils/utils";

import { Input, ToggleProps } from "@/components/ui";

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
    (
        {
            checked,
            defaultChecked,
            onCheckedChange,
            label,
            helperText,
            disabled,
            ...props
        },
        ref
    ) => {
        // Si "checked" -> on est en mode contrôlé
        // Sinon, on lit la valeur depuis l'input (uncontrolled)

        const [internalChecked, setInternalChecked] = React.useState(
            defaultChecked ?? false
        );
        const isControlled = checked !== undefined;
        const isChecked = isControlled ? checked : internalChecked;

        return (
            <div className="flex flex-col gap-1 items-center">
                <label
                className={cn(
                    "flex items-center gap-2 select-none transition-opacity",
                    disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                )}
                        // className="flex items-center gap-2 cursor-pointer select-none"
                >
                    {/* BUTTON SWITCH/TOGGLE */}
                    <span className="group relative inline-flex min-h-6 min-w-11 rounded-full bg-background border group-hover:bg-lighthover transition-colors duration-200">
                        <Input
                        ref={ref}
                        type="checkbox"
                        role="switch"
                        aria-describedby={helperText ? `${props.id}-helper` : undefined}
                        className="absolute h-full w-full opacity-0 m-0 p-0 cursor-pointer"
                        checked={isChecked}
                        defaultChecked={defaultChecked}
                        onChange={(e) => {
                            if (!isControlled) {
                                setInternalChecked(e.target.checked);
                            }
                            onCheckedChange?.(e.target.checked);
                        }}
                        {...props}
                        />
                        <span
                        className={cn(
                            "absolute left-0.5 top-1/2 h-5 w-5 rounded-full bg-dark shadow transition-transform -translate-y-1/2",
                            isChecked
                            ? "translate-x-4.5 bg-primary group-hover:bg-primaryhover"
                            : "translate-x-0 bg-dark group-hover:bg-darkhover"
                        )}
                        />
                    </span>
                    {label && <span className="text-base font-noto">{label}</span>}
                </label>
                {helperText && (
                    <p id={`${props.id}-helper`} className="font-didact text-left ml-10 text-greydarker text-sm max-w-[300px]">
                        {helperText}
                    </p>)}
            </div>
        );
    }
);

Toggle.displayName = "Toggle";