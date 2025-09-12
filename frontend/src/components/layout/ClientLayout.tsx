"use client";

import { useState } from "react";
import { Header, HeaderMobile, SideNav } from "@/components/layout";
import PageWrapper from "./PageWrapper";
import MarginWidthWrapper from "./MarginWidthWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex">
            <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
        
            <MarginWidthWrapper isCollapsed={isCollapsed}>
                <Header/>
                <HeaderMobile/>
                <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
        </div>
    );
}