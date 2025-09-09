"use client";

import React from "react";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import useScroll from "@/hooks/useScroll";
import { cn } from "@/utils/utils";

const Header = () => {
    const scrolled = useScroll(5);
    const selectedLayout = useSelectedLayoutSegment();

    return (
        <div
         className={cn(
            "sticky inset-x-0 top-0 z-30 w-full transition-all bg-primary",
            {
                "background-green-200": scrolled,
                "background-red-200": selectedLayout,
            },
         )}
        >
            <div className="flex h-[47px] items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link
                     href="/"
                     className="flex flex-row space-x-2 items-center justify-center md:hidden"
                    >
                        <span className="h-7 w-7 bg-light rounded-full"/>
                        <span className="font-medium font-oswald text-light text-xl flex">Figure de Skills</span>
                    </Link>
                </div>

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

    // <header className="h-[60px] bg-primary sticky top-0 flex items-center justify-end z-10">
    //     <div className="flex pr-10">
    //         <p className="text-light font-medium text-2xl">Bonjour, Super admin</p>
    //     </div>
    // </header>