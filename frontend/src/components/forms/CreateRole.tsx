"use client";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"

export default function CreateRoleForm() {

    return (
        <>
            <form className="flex flex-col items-center select-none">
                <div className="flex flex-col gap-6 items-center">
                    <Input label="Titre"/>
                </div>
                <Button type="submit" className="mt-8">Créer</Button>
            </form>
        </>
    )
}