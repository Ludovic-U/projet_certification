"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import LoginForm from "@/components/forms/LoginForm";
// import SideNav from "@/components/layout/SideNav";

type LoginFormInputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string>("");

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
        {/* <div>
            Page
        </div> */}
        <div className="h-full overflow-y-scroll justify-center bg-light flex flex-col items-center">
            <section className="
                        flex flex-col bg-white text-dark items-center justify-center
                        w-full h-full
                        md:w-[50%] md:h-fit
                        lg:min-w-fit lg:max-w-[25vw]
                        rounded-xl shadow-500base p-8">
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
        </div>
        </>
    );
}


// "use client";

// import { useState } from "react";

// import { FontAwesomeIcon, Icons, CirclePlus } from "@/lib/icons";

// import {
//     Button,
//     List,
//     Input,
//     Pagination,
//     clientsList
// } from "@/components/ui"

// // import { Header, SideNav } from "@/components/layout";

// export default function Home() {
//     const [isSideNavOpen, setIsSideNavOpen] = useState(false);

//     const clients = [
//         {id : 1, name: "Entreprise Alpha", sector: "Finance", contact: "Jean Dupont"},
//         { id: 2, name: "Startup Beta", sector: "Tech", contact: "Alice Martin" },
//         { id: 3, name: "Agence Gamma", sector: "Marketing", contact: "Paul Durand" },
//         { id: 4, name: "Société Delta", sector: "Industrie", contact: "Emma Leroy" },
//         { id: 5, name: "Entreprise Epsilon", sector: "Santé", contact: "Lucas Bernard" },
//         { id: 6, name: "Startup Zeta", sector: "Éducation", contact: "Clara Dubois" },        
//     ];

//     const itemsPerPage = 5;
//     const [currentPage, setCurrentPage] = useState(1);
//     const totalPages = Math.ceil(clients.length / itemsPerPage);
//     const currentData = clients.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );

//     return (
//         <div className="min-h-screen flex flex-col">
//             {/* <Header/> */}
//             <div className="flex flex-1">
//                 {/* <SideNav
//                 isOpen={isSideNavOpen}
//                 toggle={() => setIsSideNavOpen((prev) => !prev)}
//                 /> */}

//                 <main
//                  className={`
//                     flex flex-col flex-1 overflow-y-scroll bg-light transition-all duration-300
//                     ${isSideNavOpen ? "md:ml-[240px]" : "md:ml-[90px]"}
//                  `}
//                 >   
//                     <div className="flex items-center justify-between
//                                     mx-8 my-7
//                                     lg:mx-20 lg:my-10 lg:text-left">
//                         <div className="w-fit cursor-default select-none flex flex-col md:gap-2">
//                             <h1 className="font-oswald text-dark text-2xl md:text-4xl">
//                                 Liste des clients
//                             </h1>
//                             <p className="font-didact text-greydarker text-md md:text-xl">
//                                 Consultez la liste des clients et accèdez aux détails.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="flex flex-col self-center flex-1
//                                     sm:w-[90%] md:w-[80%] max-w-[1200px]">
//                         <div className="flex flex-col gap-4 mx-8 mb-6
//                                         sm:flex-row sm:justify-between sm:mx-0 sm:items-center">
//                             <Button
//                              variant="iconPrimary"
//                              size="sm">
//                                 <CirclePlus/>
//                                 Ajouter un<br/> nouveau client
//                             </Button>
//                             <Input
//                              placeholder="Rechercher dans cette liste"
//                              leftIcon={
//                                 <span>
//                                     <FontAwesomeIcon icon={Icons.search}/>
//                                 </span>
//                              }
//                              className="w-full sm:w-72 max-w-80"
//                             />
//                         </div>
                            
//                             <div className="flex-1 mb-8 flex flex-col items-center justify-center">
//                                 <List<typeof currentData[0]>
//                                 data={currentData}
//                                 columns={clientsList}
//                                 />
//                                 { totalPages > 1 && (
//                                 <div className="flex justify-center mt-10">
//                                     <Pagination
//                                     currentPage={currentPage}
//                                     totalPages={totalPages}
//                                     onPageChange={setCurrentPage}
//                                     />
//                                 </div>
//                                 )}                                
//                             </div>

//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// }