"use client";

import * as React from "react";
import { cn } from "@/utils/utils";

import { ProgressBar, CardProps } from "@/components/ui";

export const Card: React.FC<CardProps> = ({
    title,
    description,
    progress = 0,
    buttonLabel,
    onButtonClick,
    color = "#88B081",
    max,
    showPercent,
    className,
    size = "md",
}) => {
    const paddingClasses =
        size === "sm" ? "px-4 pt-3 pb-2" : "px-8 pt-6 pb-4";
    const widthClasses = size === "sm" ? "w-[240px]" : "w-100";
    const titleClasses = size === "sm" ? "text-base" : "text-xl";
    const descriptionClasses = size === "sm" ? "text-sm" : "";
    const progressClasses = size === "sm" ? "my-2" : "my-3";

    return (
        <div
         className={cn(
                "bg-white md:h-full rounded-xl shadow-500base flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-700 relative group",
            paddingClasses,
                widthClasses,
            className
         )}
         onClick={onButtonClick}
         title={buttonLabel}
        >
            <div>
                <h3
                    className={cn(
                        "uppercase font-medium font-oswald",
                        titleClasses
                    )}
                >
                    {title}
                </h3>

                {description && (
                    <p
                        className={cn(
                            "text-greydarker font-didact leading-tight",
                            descriptionClasses
                        )}
                    >
                        {description}
                    </p>
                )}

                <ProgressBar
                    className={progressClasses}
                    color={color}
                    value={progress}
                    max={max}
                    showLabel
                    showPercent={showPercent}
                />
            </div>

            {/* {buttonLabel && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-dark text-light px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {buttonLabel}
                </div>
            )} */}
        </div>
    )
}