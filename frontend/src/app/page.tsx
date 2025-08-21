"use client";

 import { useForm } from "react-hook-form";
 import { Button } from "../components/ui/button";
 import axios from "axios";
 import { useRouter } from "next/navigation";

  type LoginFormInputs = {
    email: string;
    password: string;
  };

 export default function LoginPage() {
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
     <div className="flex min-h-screen items-center justify-center bg-gray-100">
       <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
         <h2 className="text-2xl font-bold text-center mb-6">Connexion à F2S App</h2>
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           <div>
             <label className="block text-gray-700">Email</label>
             <input
              //  type="email"
               {...register("email", { required: true })}
               className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             {errors.email && <p className="text-red-500 text-sm"> REQUIRED </p>}
           </div>

           <div>
             <label className="block text-gray-700">Mot de passe</label>
             <input
              //  type="password"
               {...register("password", { required: true })}
               className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             {errors.password && <p className="text-red-500 text-sm">REQUIRED </p>}
           </div>

           <input type="submit" />
           <Button variant="outline"
           className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
           type="submit"
           > Se connecter </Button>
         </form>
       </div>
     </div>
   );
 }
