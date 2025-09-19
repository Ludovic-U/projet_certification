"use client";

import { PageHeader, Toggle} from "@/components/ui";
import React from "react";
import { useModal } from "@/hooks"
import { FontAwesomeIcon, Icons} from "@/lib/icons";

export default function BuildingPage() {

    return (
        <div className="h-full">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="bg-light flex flex-col gap-5 p-8 items-center">
            </section>
        </div>
    );
}