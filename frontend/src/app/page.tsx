"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import LoginForm from "@/components/forms/LoginForm";
import { ProjectList } from "@/components/ui/List";

type LoginFormInputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string>("");

    const users = [
        { id: 1, content: "Oui"},
        {id: 2, content: "Non"},
        {id: 3, content: "Ok"},
        {id: 4, content: "D'accord"},
        {id: 5, content: "Jsp"},
        {id: 6, content: "Test"},
    ]

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
        <main className=" overflow-scroll justify-center bg-light flex flex-col items-center">   
            <div className="mt-10 w-[70%]">
                <ProjectList
                 
                 data={[
                    {
                        id: "1",
                        title: "Projet Lambda",
                        type: "AAP",
                        step: "IDEATION (3/4 complété)",
                        contributors: 2,
                        hasSettings:true,
                    },
                   {
                        id: "2",
                        title: "Projet Lambda azrzr",
                        type: "AAP",
                        step: "IDEATION (0/4 complété)",
                        contributors: 0,
                        hasSettings: true,
                    },
                   {
                        id: "3",
                        title: "Projet Lambda",
                        type: "AAdzaP",
                        step: "CONCEPTION (2/4 complété)",
                        contributors: 8,
                        hasSettings: true,
                    },
                   {
                        id: "4",
                        title: "Projet Lafezrzmbda",
                        type: "AAP",
                        step: "PILOTAGE (6/8 complété)",
                        contributors: 13,
                        hasSettings:true,
                    },
                 ]}/>

<hr className="my-8"/>

                 <ProjectList
                 data={[
                    {
                        id: "1",
                        title: "Projet Lambda",
                        type: "AAP",
                        step: "IDEATION (3/4 complété)",
                        contributors: 2,
                    },
                   {
                        id: "2",
                        title: "Projet Lambda",
                        type: "AAP",
                        step: "IDEATION (0/4 complété)",
                        contributors: 0,
                    },
                   {
                        id: "3",
                        title: "Projet Lambda",
                        type: "AAP",
                        step: "CONCEPTION (2/4 complété)",
                        contributors: 8,
                    },
                   {
                        id: "4",
                        title: "Projet Lambda",
                        type: "AAP",
                        step: "PILOTAGE (6/8 complété)",
                        contributors: 13,
                    },
                 ]}/>

            </div>

            
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
    );
}
