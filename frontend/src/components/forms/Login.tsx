"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui"

type LoginFormInputs = {
    email: string;
    password: string;
};

interface LoginFormProps {
    onSubmit: (data: LoginFormInputs) => void;
    isLoading: boolean;
    apiError?: string;
}

export default function LoginForm({ onSubmit, isLoading, apiError }: LoginFormProps) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormInputs>();
    
    const [showPassword, setShowPassword] = useState(false);
    const passwordValue = watch("password");

    return (
        <>
            {apiError && (
                <div
                className="w-[70%] mb-4 cursor-default">
                    <p className="text-alertdanger text-center text-sm">{apiError}</p>
                </div>
            )}

            <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-10 w-[70%]"
            >

                <Input
                {...register("email", {
                    required: "L'email est requis",
                    pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide",
                    },
                })}
                label="Email"
                labelBg="bg-white"
                type="email"
                placeholder="bonjour@figuresdeskills.fr"
                error={errors.email?.message}
                leftIcon={
                    <span className="text-grey">
                        <FontAwesomeIcon icon={Icons.envelope} />
                    </span>
                }
                />

                <Input
                {...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                    value: 3,
                    message: "Le mot de passe doit contenir au moins 3 caractères",
                    },
                })}
                label="Mot de passe"
                labelBg="bg-white"
                type={showPassword ? "text" : "password"}
                placeholder="•••••••"
                error={errors.password?.message}
                rightIcon={
                    passwordValue && passwordValue.length > 0 ? (
                        <span
                        className="cursor-pointer"
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }>
                            <FontAwesomeIcon icon={showPassword ? Icons.eyeSlash : Icons.eye}/>
                        </span>
                    ) : (
                        <span className="cursor-default opacity-50">
                            <FontAwesomeIcon icon={Icons.eye} />
                        </span>
                    )
                }
                leftIcon={
                    <span className="text-grey">
                        <FontAwesomeIcon icon={Icons.lock} />
                    </span>
                }
                />

                <Button
                size="md"
                type="submit"
                disabled={isLoading}
                className="self-center">
                    {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
            </form>
        </>
    )
}