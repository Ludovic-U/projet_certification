"use client";

import { PageHeader } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";

export default function ReportingPage() {
    const { config } =  useConfig();

    return (
        <div className="h-full">
            <PageHeader title="Titre" description={config?.subtitles.reporting}/>
            <section>
                reporting/page.tsx
            </section>
        </div>
    );
}