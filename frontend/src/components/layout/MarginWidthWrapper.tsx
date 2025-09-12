"use client";
import { ReactNode } from "react";

type MarginWidthWrapperProps = {
    children: ReactNode;
    isCollapsed: boolean;
};

export default function MarginWidthWrapper({ children, isCollapsed }: MarginWidthWrapperProps){
    return (
        <div
         className={`flex flex-col min-h-screen transition-all duration-300 flex-1
                    ${isCollapsed ? "md:ml-16" : "md:ml-60"}`}>
            {children}
        </div>
    )
}