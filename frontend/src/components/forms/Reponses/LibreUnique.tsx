"use client";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"

export default function ReponseUnique() {
    const qst = "Pouvez-vous expliquer ces obstacles aussi simplement que possible ?"
    return (
        <>
            <form className="flex flex-col gap-8 items-center select-none">
                <div className="flex flex-col items-center gap-3 max-w-90">
                    <h2 className="text-dark font-bold w-full text-center font-noto">{qst}</h2>
                    <textarea className="h-20 w-full border border-dark rounded-lg p-2 resize-none focus:outline-primary hover:border-dashed hover:border-primary"/>
                </div>
                <div className="flex flex-col gap-1 items-center">
                    <Button type="submit">Valider</Button>
                    <p className="cursor-pointer text-dark w-fit font-didact underline hover:text-primaryhover">passer cette question</p>
                </div>
                
            </form>
        </>
    )
}