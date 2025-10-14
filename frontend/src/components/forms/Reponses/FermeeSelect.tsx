"use client";

import { Input, Button, Checkbox } from "@/components/ui"
import { useState } from "react";

interface Option {
    optionId: number;
    label: string;
    questionId: number;
}

interface ReponseSelectProps {
    options: Option[];
}

export default function ReponseSelect({ options }: ReponseSelectProps) {
    const [reponses, setReponses] = useState<number[]>([]);

    const toggleOption = (id: number) => {
        setReponses(prev  =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };
    return (
        <>
            {options.map(opt => (
                <div
                 key={opt.optionId}
                 className="border my-2 pl-4 py-2 rounded-lg hover:border-dashed hover:border-primay">
                    <Checkbox
                    label={opt.label}
                    checked={reponses.includes(opt.optionId)}
                    onCheckedChange={() => toggleOption(opt.optionId)}
                    />                   
                </div>
            ))}
        </>
    )
}