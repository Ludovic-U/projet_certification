"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"


export default function CreateProjectForm() {

    return (
        <>
            <form action="" className=" max-w-130 flex gap-5 flex-wrap justify-center">
                <Input
                 label="Titre du projet"
                 placeholder="ex. Blabla"
                />
                <Input
                 label="Secteur"
                 placeholder="ex. Blabla"
                />
                <Input
                 label="Titre du projet"
                 placeholder="ex. Blabla"
                />
                <Input
                 label="Secteur"
                 placeholder="ex. Blabla"
                />

            </form>
        </>
    )
}