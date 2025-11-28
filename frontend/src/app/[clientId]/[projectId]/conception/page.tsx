"use client";

import { PageHeader } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";

export default function ConceptionPage() {
    const { config } =  useConfig();

    return (
        <div className="h-full">
            <PageHeader title="Titre" description={config?.subtitles.conception}/>
            <section>
                conception/page.tsx
            </section>
        </div>
    );
}