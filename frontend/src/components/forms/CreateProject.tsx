"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"


export default function CreateProjectForm() {

    return (
        <>
            <form className="flex flex-col items-center select-none">
                <div className="flex flex-col gap-6 items-center">
                    <Input label="Titre"/>
                    <Input label="Chef de projet"/>
                    <Input label="Description"/>
                    <Input type="date" className="text-greydarker" label="Date de début"/>
                </div>
                <Button type="submit" className="mt-8">Créer</Button>
            </form>
        </>
    )
}