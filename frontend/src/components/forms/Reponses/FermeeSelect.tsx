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
                <Checkbox
                 key={i}
                 label={opt}
                 checked={reponses.includes(opt)}
                 onCheckedChange={() => toggleOption(opt)}
                />
            ))}
        </>
    )
}