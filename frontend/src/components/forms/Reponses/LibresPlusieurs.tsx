"use client";

import { DynamicOptions } from "@/components/ui"

interface ReponsesPlusieursProps {
    value?: string[];
    onChange?: (value: string[]) => void;
}

export default function ReponsesPlusieurs({ value = [""], onChange }: ReponsesPlusieursProps) {

    return (
        <>
            <DynamicOptions
             labelPrefix="Réponse"
             values={value}
             onChange={onChange || (() => {})}/>
        </>
    )
}