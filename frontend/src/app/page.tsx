"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "../components/ui/Button"

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
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
    withCredentials: true
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormInputs>();
  const onSubmit = (data: LoginFormInputs) => {
    console.log("login data: ", data)
    api.post('user/login', {
      "email": data.email,
      "password": data.password
    })
    .then(function (response) {
      console.log( "Login successful, routerpush");
      console.log( response);
      // Redirect to the home page after successful login
      router.push("/admin"); // TODO: check user role and redirect accordingly
    })
    .catch(function (error) {
      console.log( "Login failed");
      console.log( error);
      // TODO: Handle error, show message to user
      alert("Échec de la connexion. Veuillez vérifier vos identifiants. Erreur " + error.status);
    });
  };

  //   const {
  //     register,
  //     handleSubmit,
  //     formState: { errors },
  //   } = useForm<LoginFormInputs>();

  //  const onSubmit = (data: LoginFormInputs) => {
  //    console.log("Login Data:", data);
  //    // api.post('/login', data)
  //  }  

  return (
    <main className="flex flex-col min-h-screen min-w-screen items-center justify-center bg-[#F4F4F4]">
      <Button size="sm" variant="purple">
        Bouton
      </Button>
      <Button variant="purple" loading>En chargement</Button>
      <Button variant="blue" disabled>Désactivé</Button>
      <hr className="pt-8"></hr>

      
      <section className="bg-red-500 flex flex-col text-center text-[#272727] w-[25vw] h-[50vh] rounded-xl">

        <h1
         className="">
          BIENVENUE
        </h1>
        <p>Entrez vos identifiants pour vous connecter.</p>
        
        <form
         onSubmit={handleSubmit(onSubmit)}
         className="bg-pink-500 flex flex-col">
          <input
           {...register("email", {required: true})}
           className="bg-orange-500"
           type="email"
           placeholder="bonjour@figuredeskills.fr"
          />
          {errors.email && <p>Entrez votre email pour vous connecter</p>}

          <input
           {...register("password", {required: true})}
           className="bg-green-500"
           type="password"
           placeholder="*********"
          />
          {errors.password && <p>Entrez votre mot de passe pour vous connecter</p>}
        
          <Button size="md" variant="blue" type="submit">
            Se connecter
          </Button>
        </form>
      </section>
    </main>
  );
}

          //  <input type="submit" />
          //  <Button variant="outline"
          //  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          //  type="submit"
          //  > Se connecter </Button>