import React from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
    content: string;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}