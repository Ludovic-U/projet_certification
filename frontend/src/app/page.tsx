"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faEnvelope,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Action terminée!");
    }, 2000);
  };

  const router = useRouter();
  const api = axios.create({
    baseURL: "http://localhost:4000/api/",
    withCredentials: true,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const passwordValue = watch("password");
  
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

      let errorMessage = "Echec de la connexion. Veuillez véridier vos identifiants.";

      if (error.response?.status == 401) {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.response?.status == 429) {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
      } else if (error.response?.status == 500) {
        errorMessage = "Erreur du serveur. Veuillez réessayer plus tard";
      } else if (!error.response) {
        errorMessage = "Erreur de connexion. Vérifiez votre connexion internet.";
      }

      setApiError(errorMessage);
    });
  };

  return (
    <main className="h-[calc(100vh-60px)] bg-light flex flex-col items-center justify-center overflow-y-scroll">
      <section className="w-[25vw] min-w-[350px] bg-white flex flex-col items-center text-dark rounded-xl shadow-500base p-8">
        
        <img src="/logo-sm.jpeg" className="rounded-full w-12 h-12" alt="logo"/>
        <h1 className="font-oswald font-medium text-2xl my-3">BIENVENUE</h1>
        <p className="font-didact text-greydarker text-lg mb-8">Entrez vos identifiants pour vous connecter.</p>

        {apiError && (
          <div className="w-[70%] mb-4 cursor-default">
            <p className="text-alertdanger text-center text-sm">{apiError}</p>
          </div>
        )}

        <form
         onSubmit={handleSubmit(onSubmit)}
         className="flex flex-col gap-8 w-[70%]">
          
          <Input
            {...register("email", {
              required: "L'email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Adresse email invalide"
              }
            })}
            label="Email :"
            type="email"
            placeholder="bonjour@figuredeskills.fr"
            error={errors.email?.message}
            leftIcon={
              <span className="text-grey">
                <FontAwesomeIcon icon={faEnvelope}/>
              </span>
            }
          />

          <Input
            {...register("password", {
              required: "Le mot de passe est requis",
              minLength: {
                value: 3,
                message: "Le mot de passe doit contenir au moins 3 caractères"
              }
            })}
            label="Mot de passe :"
            type={showPassword ? "text" : "password"}
            placeholder="•••••••"
            error={errors.password?.message}
            rightIcon={
              passwordValue && passwordValue.length > 0 ? (
                <span
                 className="cursor-pointer"
                 onClick={() => setShowPassword(!showPassword)}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}/>
                </span>
              ) : (
                <span
                 className="cursor-default opacity-50">
                  <FontAwesomeIcon icon={faEye}/>
                </span>
              )
            }

            leftIcon={
              <span className="text-grey">
                <FontAwesomeIcon icon={faLock}/>
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
      </section>
    </main>
  );
}