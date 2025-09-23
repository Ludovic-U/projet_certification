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
            "bg-white h-full w-80 px-8 pt-6 pb-4 rounded-xl shadow-500base flex flex-col"
         )}>
            <h3 className="uppercase font-medium font-oswald text-xl">{title}</h3>

            {description && (
                <p className="text-greydarker font-didact leading-tight min-h-[2rem]">{description}</p>
            )}

            <ProgressBar className="my-3" color={color} value={progress} showLabel/>

            {buttonLabel && (
                <Button className="w-fit self-center" variant="secondary" style={{ backgroundColor: color, borderColor: color }} size="sm" onClick={onButtonClick}>{buttonLabel}</Button>
            )}
        </div>
    )
}