"use client";

import { PageHeader } from "@/components/ui";

import { useModal } from "@/hooks"

export default function BuildingPage() {
    const modal = useModal();

    return (
        <div className="h-full">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="bg-white flex flex-col gap-5">
                building/page.tsx
            </section>
        </div>
    );
}