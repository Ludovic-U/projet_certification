import React from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right" | "rightMenu" | "leftBottom";

export interface TooltipProps {
    content?: React.ReactNode;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}