"use client";

import { PageHeader, Button} from "@/components/ui";

import { useModal } from "@/hooks"
import { FontAwesomeIcon, Icons} from "@/lib/icons";

export default function BuildingPage() {
    const modal = useModal();

    return (
        <div className="h-full">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="bg-light flex flex-col gap-5 p-8 items-center">
            </section>
        </div>
    );
}