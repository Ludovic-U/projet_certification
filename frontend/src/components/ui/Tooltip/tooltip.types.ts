import React from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right" | "rightMenu";

export interface TooltipProps {
    content: string;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}