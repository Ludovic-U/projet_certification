"use client";

import { Button, DynamicOptions } from "@/components/ui"
import { useState } from "react";

export default function ReponsesPlusieurs() {
    const [reponse, setReponse] = useState([""]);

    return (
        <>
            <DynamicOptions
             labelPrefix="Réponse"
             values={reponse}
             onChange={setReponse}/>
        </>
    )
}