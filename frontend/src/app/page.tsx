"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import LoginForm from "@/components/forms/LoginForm";

import { Card } from "@/components/ui/Card";

type LoginFormInputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string>("");

    const handleClick = () => {
        console.log("Bouton cliqué")
    }

    const router = useRouter();
    const api = axios.create({
        baseURL: "http://localhost:4000/api/",
        withCredentials: true,
    });

    const onSubmit = (data: LoginFormInputs) => {
        setIsLoading(true);
        setApiError("");

        console.log("login data: ", data);

        api.post("user/login", {
            email: data.email,
            password: data.password,
        })
            .then(function (response) {
                console.log("Login successful, routerpush");
                console.log(response);
                // Redirect to the home page after successful login
                router.push("/admin"); // TODO: check user role and redirect accordingly
            })
            .catch(function (error) {
                console.log("Login failed");
                console.log(error);
                setIsLoading(false);

                let errorMessage =
                    "Echec de la connexion. Veuillez véridier vos identifiants.";

                if (error.response?.status == 401) {
                    errorMessage = "Email ou mot de passe incorrect.";
                } else if (error.response?.status == 429) {
                    errorMessage =
                        "Trop de tentatives. Veuillez réessayer plus tard.";
                } else if (error.response?.status == 500) {
                    errorMessage =
                        "Erreur du serveur. Veuillez réessayer plus tard";
                } else if (!error.response) {
                    errorMessage =
                        "Erreur de connexion. Vérifiez votre connexion internet.";
                }

                setApiError(errorMessage);
            });
    };

    return (
<>
    <div className="flex gap-5 pt-10 bg-light items-center justify-center">
        <Card
        title="ideation"
        description="Générer et structurer les idées initiales."
        progress={40}
        color="#BFD1BF"
        buttonLabel="ouvrir"
        onButtonClick={() => handleClick()}/>

        <Card
        title="conception"
        description="Définir et planifier les solutions."
        progress={40}
        color="#ACBFA9"
        buttonLabel="ouvrir"
        onButtonClick={() => handleClick()}/>

        <Card
        title="Pilotage"
        description="Suivre l'avancement et coordonner l'équipe."
        progress={40}
        color="#83A18F"
        buttonLabel="ouvrir"
        onButtonClick={() => handleClick()}/>

        <Card
        title="Reporting"
        description="Analyser les résultats et partager les bilans."
        progress={40}
        color="#6D8E76"
        buttonLabel="ouvrir"
        onButtonClick={() => handleClick()}/>        

    </div>

        <main className="h-screen w-screen overflow-y-scroll justify-center bg-light flex flex-col items-center">   
            <section className="w-[25vw] min-w-[350px] bg-white flex flex-col items-center text-dark rounded-xl shadow-500base p-8">
                <img
                    src="/logo-sm.jpeg"
                    className="rounded-full w-12 h-12"
                    alt="logo"
                />
                <h1 className="cursor-default font-oswald font-medium text-2xl my-3">
                    BIENVENUE
                </h1>
                <p className="cursor-default font-didact text-center text-greydarker text-lg mb-8">
                    Entrez vos identifiants pour vous connecter.
                </p>

                <LoginForm
                 onSubmit={onSubmit}
                 isLoading={isLoading}
                 apiError={apiError}
                />
            </section>
        </main>
</>
    );
}
