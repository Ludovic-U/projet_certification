"use client";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"

export default function CreateProjectForm() {

    return (
        <>
            <form action="" className="max-w-130 flex flex-col items-center gap-5">
                <div className="flex flex-col gap-3 px-8 justify-center">
                    <textarea>
                    </textarea>
                </div>


                <Button className="my-3">Valider</Button>
            </form>
        </>
    )
}