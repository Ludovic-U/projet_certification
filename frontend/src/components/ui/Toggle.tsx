"use client";

import * as React from "react";
import { cn } from "@/utils/utils";
import { ToggleProps } from "./toggle.types";
import { Input } from "./Input";

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
    (
        {
            checked,
            defaultChecked,
            onCheckedChange,
            label,
            helperText,
            ...props
        },
        ref
    ) => {
        return (
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="group relative inline-flex h-6 w-11 rounded-full bg-background border hover:bg-lighthover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                    <Input
                     ref={ref}
                     type="checkbox"
                     role="switch"
                     className="absolute h-full w-full opacity-0 m-0 p-0 cursor-pointer"
                     checked={checked}
                     defaultChecked={defaultChecked}
                     onChange={(e) => onCheckedChange?.(e.target.checked)}
                     {...props}
                    />
                    <span
                     className={cn(
                        "absolute left-0.5 top-1/2 h-5 w-5 rounded-full bg-dark shadow transition-transform -translate-y-1/2",
                        checked ? "translate-x-4.5 bg-primary group-hover:bg-primaryhover" : "translate-x-0 bg-dark group-hover:bg-darkhover"
                     )}
                    />
                </span>
                {label && <span className="text-base font-noto">{label}</span>}
                {helperText && <p className="text-sm font-didact text-greydarker">{helperText}</p>}
            </label>
        );
    }
);

Toggle.displayName = "Toggle";