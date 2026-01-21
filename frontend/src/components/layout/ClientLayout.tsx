// Composant principal qui décide Quel layout afficher
// Détextion de la page courante via usePathname(), logique conditionnelle (page publique vs page avec sidenav), gestion de l'état (sidebar ouvert/fermé), distribution des props (isCollapsed) aux composants enfants
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header, HeaderMobile, SideNav } from "@/components/layout";
import PageWrapper from "./PageWrapper";
import MarginWidthWrapper from "./MarginWidthWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const pathname = usePathname();

    const publicPages = ['/'];
    const isPublicPage = publicPages.includes(pathname);

    // Si l'user se trouve sur le path "/", alors uniquement la page children est affichée
    if (isPublicPage) {
        return (
            <div className="min-h-screen bg-light">
                {children}
            </div>
    );
    }

    // Si l'user se trouve sur une autre page, alors la page s'affiche avec le header et sidenav
    return (
        <div className="flex">
            <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
        
            <MarginWidthWrapper isCollapsed={isCollapsed}>
                {/* <Header/>
                <HeaderMobile/> */}
                <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
        </div>
    )
}