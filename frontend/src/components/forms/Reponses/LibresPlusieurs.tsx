"use client";

import { Button, DynamicOptions } from "@/components/ui"
import { useState } from "react";

export default function ReponsesPlusieurs() {
    const [reponse, setReponse] = useState([""]);

    const qst = "Pouvez-vous expliquer ces obstacles aussi simplement que possible ?"
    return (
        <>
            <form className="flex flex-col gap-8 items-center select-none">
                <div className="flex flex-col items-center gap-3 max-w-90">
                    <h2 className="font-bold text-dark w-full text-center font-noto">{qst}</h2>
                    <DynamicOptions
                     labelPrefix="Réponse"
                     values={reponse}
                     onChange={setReponse}/>
                </div>
                <div className="flex flex-col gap-1 items-center">
                    <Button type="submit">Valider</Button>
                    <p className="cursor-pointer text-dark w-fit font-didact underline hover:text-primaryhover">passer cette question</p>
                </div>
            </form>
        </>
    )
}