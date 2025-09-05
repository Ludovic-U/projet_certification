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
    );
}


// "use client";

// import { useState } from "react";

// import Header from "@/components/layout/Header"
// import SideNav from "@/components/layout/SideNav"
// import { Button } from "@/components/ui";
// import { List } from "@/components/ui/List";
// import { Input } from "@/components/ui/Input";
// import { Pagination } from "@/components/ui/Pagination";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { clientsList } from "@/components/ui/list.variants/clientsList";

// export default function Home() {
//     const [isSideNavOpen, setIsSideNavOpen] = useState(false);

//     const CirclePlus = () => (
//         <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary group-hover:bg-primaryhover transition-colors duration-200 ease-in-out">
//             <FontAwesomeIcon
//             icon={faPlus}
//             className="text-light group-hover:text-lighthover"
//             size="xl"/>
//         </div>
//     );

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
//             <Header/>
//             <div className="flex flex-1">
//                 <SideNav
//                 isOpen={isSideNavOpen}
//                 toggle={() => setIsSideNavOpen((prev) => !prev)}
//                 />

//                 <main
//                  className={`
//                     overflow-y-scroll flex flex-col bg-light transition-all duration-300 flex-1
//                     ${isSideNavOpen ? "ml-[240px]" : "ml-[90px]"}
//                  `}
//                 >   
//                     <div className="flex items-center justify-between mx-20 my-10">
//                         <div className="w-fit cursor-default select-none flex flex-col gap-2">
//                             <h1 className="font-oswald text-dark text-4xl">
//                                 Liste des clients
//                             </h1>
//                             <p className="font-didact text-greydarker text-xl">
//                                 Consultez la liste des clients et accèdez aux détails.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="flex flex-col self-center w-[80%] max-w-[1200px] flex-1">
//                         <div className="flex justify-between ">
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
//                                     <FontAwesomeIcon icon={faSearch}/>
//                                 </span>
//                              }
//                              className="min-w-70 max-w-80"
//                             />
//                         </div>
                            
//                             <List<typeof currentData[0]>
//                             data={currentData}
//                             columns={clientsList}
//                             />
//                          {totalPages > 1 && (
//                             <div className="flex justify-center mt-10">
//                                 <Pagination
//                                 currentPage={currentPage}
//                                 totalPages={totalPages}
//                                 onPageChange={setCurrentPage}
//                                 />
//                              </div>
//                         )}
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// }