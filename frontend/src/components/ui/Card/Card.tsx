"use client";

import * as React from "react";
import { cn } from "@/utils/utils";

import { ProgressBar, Button, CardProps} from "@/components/ui";

export const Card: React.FC<CardProps> = ({
    title,
    description,
    progress = 0,
    buttonLabel,
    onButtonClick,
    color = "#88B081",
    className,
}) => {
    return (
        <div
         className={cn(
            "bg-white h-fit min-w-58 max-w-70 px-8 pt-6 pb-4 rounded-lg shadow-500base flex flex-col"
         )}>
            <h3 className="uppercase font-medium font-oswald text-xl">{title}</h3>

            {description && (
                <p className="text-greydarker font-didact leading-tight mb-2">{description}</p>
            )}

            <ProgressBar className="my-3" color={color} value={progress} showLabel/>

            {buttonLabel && (
                <Button className="w-fit self-center" style={{ backgroundColor: color }} variant="secondary" size="sm" onClick={onButtonClick}>{buttonLabel}</Button>
            )}
        </div>
    )
}