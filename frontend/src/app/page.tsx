"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faXmark, faGear, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../components/ui/Button";

const CirclePlus = () => (
  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary group-hover:bg-primaryhover transition-colors duration-200 ease-in-out">
    <FontAwesomeIcon icon={faPlus} className="text-light group-hover:text-lighthover" size="xl"/>
  </div>
)

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
    <main className="h-[calc(100vh-60px)] flex items-center justify-center bg-light overflow-y-scroll">
      <section className="bg-white items-center flex flex-col text-center text-[#272727] w-[25vw] h-[50vh] rounded-xl">
        <h1
         className="">
          BIENVENUE
        </h1>
        <p>Entrez vos identifiants pour vous connecter.</p>
        
        <form
         onSubmit={handleSubmit(onSubmit)}
         className="bg-pink-500 flex flex-col items-center">
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
        
          <Button size="md">
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