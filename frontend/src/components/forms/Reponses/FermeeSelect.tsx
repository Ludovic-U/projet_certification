"use client";

import { Input, Button, Checkbox } from "@/components/ui"
import { useState } from "react";

export default function ReponseSelect() {
    const [reponses, setReponses] = useState<string[]>([]);

    const options = ["Manque de temps pour tester les idées", "Budget limité pour le projet", "Besoin de valider l'intéret du marché", "Identifier les concurrents principaux"];
    const toggleOption = (option: string) => {
        setReponses(prev  =>
            prev.includes(option) ? prev.filter(r => r !== option) : [...prev, option]
        );
    };
    return (
        <>
            {options.map((opt, i) => (
                <div className="border my-2 pl-4 py-2 rounded-lg hover:border-dashed hover:border-primay">
                    <Checkbox
                    key={i}
                    className=""
                    label={opt}
                    checked={reponses.includes(opt)}
                    onCheckedChange={() => toggleOption(opt)}
                    />                   
                </div>
            ))}
        </>
    )
}