"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faLock,
    faEye,
    faEyeSlash
} from "@fortawesome/free-solid-svg-icons";

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
            className="flex flex-col gap-8 w-[70%]"
            >

                <Input
                {...register("email", {
                    required: "L'email est requis",
                    pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide",
                    },
                })}
                label="Email :"
                type="email"
                placeholder="bonjour@figuredeskills.fr"
                error={errors.email?.message}
                leftIcon={
                    <span className="text-grey">
                        <FontAwesomeIcon icon={faEnvelope} />
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
                label="Mot de passe :"
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
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}/>
                        </span>
                    ) : (
                        <span className="cursor-default opacity-50">
                            <FontAwesomeIcon icon={faEye} />
                        </span>
                    )
                }
                leftIcon={
                    <span className="text-grey">
                        <FontAwesomeIcon icon={faLock} />
                    </span>
                }
                />

                <Button
                size="md"
                type="submit"
                disabled={isLoading}
                className="mt-6 self-center">
                    {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
            </form>
        </>
    )
}