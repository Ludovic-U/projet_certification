"use client";

import React from "react";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import useScroll from "@/hooks/useScroll";
import { cn } from "@/utils/utils";

const Header = () => {
    // scrolled = true si l'user a scrollé de plus de 5px, false sinon
    const scrolled = useScroll(5);
    // Recupère le segment de la route selectionnée, par ex "/projects"
    const selectedLayout = useSelectedLayoutSegment();

    return (
        <div
         className={cn(
            "sticky inset-x-0 top-0 z-30 w-full transition-all bg-primary",
            {
                // Appliqué si l'user a scrollé
                "background-green-200": scrolled,
                // Appliqué si un segment de layout est actif
                "background-red-200": selectedLayout,
            },
         )}
        >
            <div className="flex h-[47px] items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    {/* Affiché uniquement sur mobile md:hidden */}
                    <Link
                     href="/"
                     className="flex flex-row space-x-2 items-center justify-center md:hidden"
                    >
                        <span className="h-7 w-7 bg-light rounded-full"/>
                        <span className="font-medium font-oswald text-light text-xl flex">Figure de Skills</span>
                    </Link>
                </div>
                {/* Contenu visible uniquement sur écran taille md (en dessous = mobile) */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="h-8 w-8 rounded-full bg-light flex items-center justify-center text-center">
                        <span className="font-semibold text-sm">HQ</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;