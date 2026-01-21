"use client";

import { PageHeader } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";

export default function PilotagePage() {
    const { config } =  useConfig();

    return (
        <div className="h-full">
            <PageHeader title="Titre" description={config?.subtitles.pilotage}/>
            <section>
                pilotage/page.tsx
            </section>
        </div>
    );
}