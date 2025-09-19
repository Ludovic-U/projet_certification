"use client";

import { PageHeader, ProgressBar} from "@/components/ui";

import { useModal } from "@/hooks"
import { FontAwesomeIcon, Icons} from "@/lib/icons";

export default function BuildingPage() {
    const modal = useModal();

    return (
        <div className="h-full">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="bg-light flex flex-col gap-5 p-8 items-center">
                <div className="w-50 space-y-5">
                    <ProgressBar value={30} color="#ACBFA9"/>
                    <ProgressBar value={60} color="#83A18F" showLabel/>
                    <ProgressBar value={80} color="#577A56" size="lg" showLabel/>
                </div>
                

            </section>
        </div>
    );
}