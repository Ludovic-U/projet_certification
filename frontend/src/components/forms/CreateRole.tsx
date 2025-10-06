"use client";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button, Checkbox } from "@/components/ui"

export default function CreateRoleForm() {

    return (
        <>
            <form className="flex flex-col items-center select-none">
                <div className="flex flex-col gap-6 items-center">
                    <Input label="Titre"/>
                    <div className="flex gap-5">
                        <div>
                            <Checkbox label="Tout selectionner"/>
                            <Checkbox label="Modifier a"/>
                            <Checkbox label="Modifier b"/>
                            <Checkbox label="Modifier c"/>
                            <Checkbox label="Modifier d"/>
                            <Checkbox label="Modifier e"/>
                            <Checkbox label="Modifier f"/>
                        </div>
                        <div>
                            <Checkbox label="Ajouter a"/>
                            <Checkbox label="Ajouter b"/>
                            <Checkbox label="Ajouter c"/>
                            <Checkbox label="Ajouter d"/>
                            <Checkbox label="Ajouter e"/>
                            <Checkbox label="Ajouter f"/>
                            <Checkbox label="Ajouter g"/>
                        </div>
                    </div>

                </div>
                <Button type="submit" className="mt-8">Créer</Button>
            </form>
        </>
    )
}