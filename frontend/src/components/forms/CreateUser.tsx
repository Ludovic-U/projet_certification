"use client";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"

export default function CreateUserForm() {
    return (
        <>
            <form className="flex flex-col gap-8 items-center select-none">
                <div className="flex flex-col gap-6 items-center">
                    <Input label="Nom de famille"/>
                    <Input label="Prénom"/>
                    <Input label="Email"/>    
                    <Input label="Rôle" placeholder="ex. admin"/>                
                </div>
                <Button type="submit">Créer</Button>
            </form>
        </>
    )
}