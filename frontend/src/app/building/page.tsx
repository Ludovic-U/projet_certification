"use client";

import { PageHeader } from "@/components/ui";
import TreeView from "@/components/ui/Tree/TreeView";

export default function BuildingPage() {

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="flex-1 bg-primary/50 flex flex-col items-center justify-center">
            </section>
        </div>
    );
}