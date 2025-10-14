"use client";

import * as React from "react";
import { cn } from "@/utils/utils";
import { createPortal } from "react-dom";
import { TooltipProps } from "./tooltip.types";

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = "bottom",
    children,
    className,
}) => {
    const [visible, setVisible] = React.useState(false);
    const [coords, setCoords] = React.useState<{ top: number; left: number}>({
        top: 0,
        left: 0,
    });
    const ref = React.useRef<HTMLDivElement>(null);

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

    React.useEffect(() => {
        if (visible && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setCoords({ top: rect.top, left: rect.left + rect.width * 1.5});
        }
    }, [visible]);

    return (
        <>
            <div
            ref={ref}
            className="inline-block group"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}>
                {children}
            </div>

            {visible && 
             content &&
             createPortal(
                <div
                 className={cn(
                    "fixed z-[9999] px-3 py-1.5",
                    "bg-[rgba(39,39,39,0.6)] rounded-lg shadow-500base",
                    "font-noto text-light text-sm",
                    "pointer-events-none",
                    className
                 )}
                 style={{
                    top: coords.top,
                    left: coords.left,
                    transform: positionClasses
                 }}
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
};