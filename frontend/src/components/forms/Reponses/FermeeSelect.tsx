"use client";

import { Input, Button, Checkbox } from "@/components/ui"
import { useState } from "react";

export default function ReponseSelect() {
    const [reponses, setReponses] = useState<string[]>([]);

    const qst = "Pouvez-vous expliquer ces obstacles aussi simplement que possible ?"

    const options = ["Manque de temps pour tester les idées", "Budget limité pour le projet", "Besoin de valider l'intéret du marché", "Identifier les concurrents principaux"];
    const toggleOption = (option: string) => {
        setReponses(prev  =>
            prev.includes(option) ? prev.filter(r => r !== option) : [...prev, option]
        );
    };
    return (
        <>
            <form className="flex flex-col gap-8 items-center select-none">
                <div className="space-y-3 flex flex-col items-center">
                    <h2 className="text-dark font-bold w-full text-center font-noto">{qst}</h2>
                    <div className="w-fit space-y-1 max-h-50 p-1 overflow-y-auto">
                        {options.map((opt, i) => (
                            <Checkbox
                             key={i}
                             label={opt}
                             checked={reponses.includes(opt)}
                             onCheckedChange={() => toggleOption(opt)}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-center">
                    <Button type="submit">Valider</Button>
                    <p className="cursor-pointer text-dark w-fit font-didact underline hover:text-primaryhover">passer cette question</p>
                </div>
            </form>
        </>
    )
}