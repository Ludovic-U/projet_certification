"use client";

import { Input, Button, Checkbox } from "@/components/ui"

interface Option {
    optionId: number;
    label: string;
    questionId: number;
}

interface ReponseSelectProps {
    options: Option[];
    value?: number[];
    onChange?: (value: number[]) => void;
}

export default function ReponseSelect({ options, value = [], onChange }: ReponseSelectProps) {
    const toggleOption = (id: number) => {
        const newValue = value.includes(id) 
            ? value.filter(r => r !== id) 
            : [...value, id];
        onChange?.(newValue);
    };
    return (
        <>
            {options.map(opt => (
                <div
                 key={opt.optionId}
                 className="border my-2 pl-4 py-2 rounded-lg hover:border-dashed hover:border-primay">
                    <Checkbox
                    label={opt.label}
                    checked={value.includes(opt.optionId)}
                    onCheckedChange={() => toggleOption(opt.optionId)}
                    />                   
                </div>
            ))}
        </>
    )
}