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
}) => {
    return (
        <div
         className={cn(
            "bg-white md:h-full w-100 px-8 pt-6 pb-4 rounded-xl shadow-500base flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-700 relative group",
            className
         )}
         onClick={onButtonClick}
         title={buttonLabel}
        >
            <div>
                <h3 className="uppercase font-medium font-oswald text-xl">{title}</h3>

                {description && (
                    <p className="text-greydarker font-didact leading-tight">{description}</p>
                )}

                <ProgressBar
                    className="my-3"
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