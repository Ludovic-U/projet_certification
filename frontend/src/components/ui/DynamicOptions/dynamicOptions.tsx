"use client";

import { Input, Button, Tooltip } from "@/components/ui"
import { FontAwesomeIcon, Icons } from "@/lib/icons";

interface DynamicOptionsProps {
    labelPrefix?: string;
    values: string[];
    onChange: (values: string[]) => void;
}

export function DynamicOptions({
    labelPrefix = "Option",
    values,
    onChange,
}: DynamicOptionsProps) {
    const addField = () => onChange([...values, ""])

    const updateField = (index: number, value: string) => {
        const updated = [...values];
        updated[index] = value;
        onChange(updated);
    }

    const removeField = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col items-center">
            <div className="space-y-4 max-h-30 overflow-y-auto p-2">
                {values.map((val, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Input
                        className="flex-1"
                        label={`${labelPrefix} ${index + 1}`}
                        value={val}
                        onChange={(e) => updateField(index, e.target.value)}/>
                        {values.length > 1 && (
                            <Tooltip content="Supprimer" position="left">
                                <Button
                                type="button"
                                variant="primaryBorder"
                                size="iconS"
                                onClick={() => removeField(index)}>
                                    <FontAwesomeIcon icon={Icons.xmark}/>
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                ))}
            </div>

            <Tooltip content="Ajouter" position="right">
                <Button type="button" variant="secondary" size="icon" onClick={addField}>
                    <FontAwesomeIcon icon={Icons.plus}/>
                </Button>                
            </Tooltip>
        </div>
    )
}