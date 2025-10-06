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
        <div className="flex flex-col w-full gap-2">
            <div className="flex justify-start items-center gap-1">
                <Tooltip content="Ajouter" position="right">
                    <Button type="button" variant="primaryBorder" size="iconS" onClick={addField}>
                        <FontAwesomeIcon icon={Icons.plus}/>
                    </Button>
                </Tooltip>
                <span className="text-sm font-didact text-greydarker">Ajouter une réponse</span>
            </div>

            <div className="flex flex-col gap-4 max-h-60 w-full overflow-y-auto py-4">
                {values.map((val, index) => (
                    <div key={index}>
                        <Input
                         label={`${labelPrefix} ${index + 1}`}
                         labelBg="bg-white"
                         value={val}
                         onChange={(e) => updateField(index, e.target.value)}
                         rightIcon={
                            values.length > 1 && (
                                <Tooltip content="Supprimer" position="left">
                                    <button
                                     type="button"
                                     onClick={() => removeField(index)}
                                     className="cursor-pointer text-grey hover:text-greydarker transition-colors">
                                        <FontAwesomeIcon icon={Icons.trash}/>
                                    </button>
                                </Tooltip>
                            )
                         }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}