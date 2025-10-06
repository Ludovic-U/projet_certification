import React from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right" | "rightMenu" | "leftBottom" | "rightBottom" | "leftTop" | "rightTop";

export interface TooltipProps {
    content?: React.ReactNode;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}