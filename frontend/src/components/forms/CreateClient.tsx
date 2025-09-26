"use client";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"


export default function CreateUserForm() {

    return (
        <>
            <form className="flex flex-col gap-8 items-center select-none">
                <div className="flex flex-col gap-8 items-center">
                    <Input label="Nom"/>
                    <Input label="Type"/>
                    <Input label="Description"/>                    
                </div>
            </form>
            <Button type="submit" className="mt-8">Créer</Button>
        </>
    )
}