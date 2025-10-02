"use client";

import { useState } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import {
    Input,
    Button,
    Toggle,
    DynamicOptions,
    MultiSelect,
    Select
} from "@/components/ui"

export default function CreateQuestionForm() {
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [options, setOptions] = useState([""]);

    const categories = [
        {value: "ideation", label: "Idéation"},
        {value: "conception", label: "Conception"},
    ]

    const [selectedType, setSelectedType] = useState<string[]>([]);
    const types = [
        "Startup",
        "PME",
        "ESN",
        "CPF",
        "OPCO",
        "GRETA",
        "Universités et grandes écoles",
        "CFA",
        "Associations de formation continue",
        "Collectivités territoriales",
        "CNRS",
        "ONG",
        "CCI",
        "BTP"
    ]
    return (
        <>
            <form className="select-none flex flex-col items-center">
                    <div className="space-y-5">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input label="Question"/>
                            </div>
                            <Input className="w-28" label="ID parent"/>
                        </div>
                        <div className="flex gap-3">
                            <Select
                             className="flex-1"
                             label="Catégorie"
                             options={categories}/>

                            <MultiSelect
                             className="flex-1 max-w-70"
                             value={selectedType}
                             onChange={setSelectedType}
                             label="Type"
                             options={types}/>
                        </div>
                    </div>

                    <div className="w-100 space-y-3 my-4">
                        <Toggle
                        label="Autoriser plusieurs réponses libres."
                        helperText="Le client pourra saisir plus d'une réponse écrite."/>

                        <Toggle
                        label="Répéter la question."
                        helperText="La question sera posée une fois pour chaque élément défini dans la question précédente."/>
                        
                        <Toggle
                        checked={allowMultiple}
                        onCheckedChange={setAllowMultiple}
                        label="Proposer une liste d'options"
                        helperText="Activez pour définir des choix que le client pourra sélectionner."/>
                    
                            {allowMultiple && (
                                <DynamicOptions
                                 labelPrefix="Option"
                                 values={options}
                                 onChange={setOptions}/>
                            )}                    
                    </div>
                    <Button type="submit">Créer</Button>
            </form>
        </>
    )
}