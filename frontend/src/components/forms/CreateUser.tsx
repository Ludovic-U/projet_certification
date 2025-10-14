"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui";

export type CreateUserInputs = {
    lastname: string;
    firstname: string;
    email: string;
    role: string;
    clientId: number,
    position: string // si nécessaire
};

interface CreateUserFormProps {
    onSubmit: (data: CreateUserInputs) => void;
    isLoading: boolean;
    apiError?: string;
}

export default function CreateUserForm({ onSubmit, isLoading, apiError }: CreateUserFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateUserInputs>();

    return (
        <>
            {apiError && (
                <div className="w-[70%] mb-4 cursor-default">
                    <p className="text-alertdanger text-center text-sm">{apiError}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-8 items-center select-none w-[70%]"
            >
                <div className="flex flex-col gap-6 items-center w-full">
                    <Input
                        {...register("lastname", { required: "Le nom de famille est requis" })}
                        label="Nom de famille"
                        error={errors.lastname?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.users} />}
                    />
                    <Input
                        {...register("firstname", { required: "Le prénom est requis" })}
                        label="Prénom"
                        error={errors.firstname?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.users} />}
                    />
                    <Input
                        {...register("email", {
                            required: "L'email est requis",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Adresse email invalide",
                            },
                        })}
                        label="Email"
                        type="email"
                        error={errors.email?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.envelope} />}
                    />
                    <Input
                        {...register("role", { required: "Le rôle est requis" })}
                        label="Rôle"
                        placeholder="ex. admin"
                        error={errors.role?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.userTie} />}
                    />
                    <Input
                        {...register("position", { required: "Position dans l'organisation" })}
                        label="Position"
                        error={errors.position?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.userTie} />}
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer"}
                </Button>
            </form>
        </>
    );
}