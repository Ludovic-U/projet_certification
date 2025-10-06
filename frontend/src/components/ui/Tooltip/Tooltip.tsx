"use client";

import * as React from "react";
import { cn } from "@/utils/utils";

import { TooltipProps } from "./tooltip.types";

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = "bottom",
    children,
    className,
}) => {
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
        rightMenu: "left-full top-1/2 -translate-y-1/2 ml-4",
        leftTop: "bottom-full right-1/2 mb-1",
        rightTop: "bottom-full left-1/2 mb-1",
        leftBottom: "top-full right-1/2 mt-1",
        rightBottom: "top-full left-1/2 mt-1",
    }[position];

    return (
        <div className="relative inline-block group">
            {children}

            <div
             className={cn(
                "absolute z-9999 px-3 py-1.5 opacity-0 invisible transition-all duration-200",
                "bg-[rgba(39,39,39,0.6)] rounded-lg shadow-500base",
                "font-noto text-light text-sm",
                "group-hover opacity-100 group-hover:visible",
                "max-w-[250px] truncate",
                positionClasses,
                className
             )}
            >
                {content}
            </div>
        </div>
    );
};