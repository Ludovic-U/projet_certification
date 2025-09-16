"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { Button, Input } from "@/components/ui";

type RegisterFormInputs = {
    username: string,
    email: string,
};

interface RegisterFormProps {
    onSubmit?: (data: RegisterFormInputs) => void;
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();

    return (
        <form
         onSubmit={handleSubmit(onSubmit ?? (() => {}))}
         className="flex flex-col gap-5 w-[80%] items-center">
            <div className="flex gap-3">
                <Input
                {...register("username", {required: "Le nom est requis"})}
                label="Nom"
                placeholder="Nom"
                error={errors.username?.message}
                />

                <Input
                {...register("email", {required: "L'adresse mail est requise"})}
                label="Email"
                placeholder="figure2@skills.fr"
                error={errors.email?.message}
                />
            </div>

            <Button
             className="m-3"
             type="submit">
                Créer
            </Button>
         </form>
    )
}

export { RegisterForm };