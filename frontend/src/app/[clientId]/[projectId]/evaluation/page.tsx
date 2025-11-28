"use client";

import { PageHeader } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";

export default function EvaluationPage() {
    const { config } =  useConfig();

    return (
        <div className="h-full">
            <PageHeader title="Evaluation" description={config?.subtitles.evaluation}/>
            <section>
                evaluation/page.tsx
            </section>
        </div>
    );
}