"use client";

import React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import useScroll from "@/hooks/use-scroll";
import { cn } from "@/utils/utils";

export default function Header() {
    const scrolled = useScroll(5);

    return (
    <header className="h-[60px] bg-primary sticky top-0 flex items-center justify-end z-10">
        <div className="flex pr-10">
            <p className="text-light font-medium text-2xl">Bonjour, Super admin</p>
        </div>
    </header>
    )
}