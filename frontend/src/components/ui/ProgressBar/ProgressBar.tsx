"use client";

import * as React from "react";
import { cn } from "@/utils/utils";

import { ProgressBarProps } from "./progressBar.types";

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    size = "md",
    className,
    color = "primary",
    showLabel = false,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const height = size === "sm" ? "h-2" : size === "md" ? "h-3" : "h-4";

    return (
        <div className={cn("w-full flex flex-col", className)}>
            <div className={cn("relative w-full bg-grey rounded-full overflow-hidden", height, "bg-grey")}>
                <div
                className="h-full transition-all duration-300"
                style={{width: `${percentage}%`, backgroundColor: color}}
                />
            </div>
            {showLabel && (
                <span className="inline-flex justify-between text-sm text-greydarker font-noto">
                    <span>Avancement</span>
                    <span>{Math.round(percentage)}%</span>
                </span>
            )}   
        </div>
    );
};