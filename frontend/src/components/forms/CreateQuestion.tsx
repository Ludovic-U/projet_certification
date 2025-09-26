"use client";

import { useState } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import {
    Input,
    Button,
    Toggle
} from "@/components/ui"

export default function CreateQuestionForm() {
    const [allowMultiple, setAllowMultiple] = useState(false);

    return (
        <>
            <form className="w-[90%] flex flex-col items-center select-none">
                <div className="flex flex-col gap-6">
                    <Input className="w-full" label="Question"/>
                    <div className="flex gap-3">
                    <Input label="Catégorie"/>
                    <Input label="Type"/>                        
                    </div>
                    
                    {/* TODO : grid pour afficher les toggle */}

                        <Toggle
                        label="multiples réponses écrites ?"
                        helperText=""/>

                        <Toggle
                        label="Répéter cette question"
                        helperText="Activer pour répéter cette question à chaque réponse donnée à la précédente"/>
                        
                        <Toggle
                        checked={allowMultiple}
                        onCheckedChange={setAllowMultiple}
                        label="multiples réponses radio ?"
                        helperText="Activer pour"/>
                        
                        {allowMultiple && (
                            <div className="space-y-3 flex flex-col items-center">
                                <Input label="Option 1"/>
                                <Input label="Option 2"/>
                                <Input label="Option 3"/>                            
                            </div>
                        )}
                </div>
                <Button type="submit" className="mt-8">Créer</Button>
            </form>
        </>
    )
}