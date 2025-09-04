"use client";

import { useState } from "react";

import Header from "@/components/layout/Header"
import SideNav from "@/components/layout/SideNav"

import { Button } from "@/components/ui";
import { List } from "@/components/ui/List";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faGear, faUsers } from "@fortawesome/free-solid-svg-icons";

export default function Home() {

    const [isSideNavOpen, setIsSideNavOpen] = useState(false);

    const CirclePlus = () => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary group-hover:bg-primaryhover transition-colors duration-200 ease-in-out">
            <FontAwesomeIcon
            icon={faPlus}
            className="text-light group-hover:text-lighthover"
            size="xl"/>
        </div>
    );

        const projectColums = [
            {key: "id", label: "ID", className: "w-15"},
            { key: "title", label: "Titre", render: (item: any) => <span className="block truncate text-left font-medium">{item.title}</span> },
            { key: "type", label: "Type", render: (item: any) => <span className="inline-block border px-4 py-1 rounded-full text-sm font-medium">{item.type}</span> },
            { key: "step", label: "Étape", render: (item: any) => <span className="text-primary font-bold uppercase">{item.step}</span> },
            { key: "contributors", label: "Contributeurs", render: (item: any) => (
                <span className="font-bold">
                    <FontAwesomeIcon className="mr-2" icon={faUsers} />
                    {item.contributors}
                </span>
              )
            },
            { key: "actions", label: "Actions", render: (item: any) => (
                <Button size="sm" variant="iconPrimary">
                    <FontAwesomeIcon icon={faGear} />
                    Paramètres
                </Button>
              )
            },
        ];

        const projects = [
        { id: 1, title: "Projet lamazeazebda", type: "AAP", step:"REPORTING (1/4)", contributors: 12},
        { id: 2, title: "Projet lambda", type: "POC", step:"Pilotage (1/4)", contributors: 3},
        { id: 3, title: "Projet lamhbda un titre long", type: "MVP", step:"IDEATION (1/4)", contributors: 3},
        { id: 4, title: "Projet lambda avec un titre encore plus long", type: "R&D", step:"IDEATION (1/4)", contributors: 3},
        { id: 5, title: "Projet lambda je ne pense pas que des titres seront aussi longs mais au cas où", type: "Concours / Challenge", step:"IDEATION (1/4)", contributors: 3},
        { id: 6, title: "Projet lambda", type: "Campagne", step:"IDEATION (1/4)", contributors: 3},
        { id: 7, title: "Projet lambda", type: "Sprint", step:"IDEATION (1/4)", contributors: 3},
        { id: 8, title: "Projet lambda", type: "Concours", step:"IDEATION (1/4)", contributors: 8},
        { id: 9, title: "Projet lambda", type: "Programme", step:"IDEATION (1/4)", contributors: 3},
        { id: 10, title: "Projet lambda", type: "Initiative", step:"IDEATION (1/4)", contributors: 3},
        { id: 11, title: "Projet lambda", type: "Contrat / Prestation", step:"IDEATION (1/4)", contributors: 3},
        { id: 12, title: "Projet lambda", type: "Concours / Challenge", step:"IDEATION (1/4)", contributors: 3},
        { id: 13, title: "Projet lambda", type: "AAP", step:"PILOTAGE (1/4)", contributors: 3},
        { id: 14, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
        { id: 15, title: "Projet lambda", type: "AAP", step:"REPORTING (1/4)", contributors: 3},
        { id: 16, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
        { id: 17, title: "Projet lambda", type: "AAP", step:"CONCEPTION (1/4)", contributors: 3},
        { id: 18, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
        { id: 19, title: "Projet lambda", type: "AAP", step:"CONCEPTION (8/10)", contributors: 3},
        { id: 20, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
    ]

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <div className="flex flex-1">
                <SideNav
                isOpen={isSideNavOpen}
                toggle={() => setIsSideNavOpen((prev) => !prev)}
                />

                <main
                 className={`
                    overflow-y-scroll flex flex-col bg-light transition-all duration-300 flex-1
                    ${isSideNavOpen ? "ml-[240px]" : "ml-[90px]"}
                 `}
                >   
                    <div className="flex items-center justify-between mx-20 my-10">
                        <div className="w-fit cursor-default select-none flex flex-col gap-2">
                            <h1 className="font-oswald text-dark text-4xl">
                                Liste des clients
                            </h1>
                            <p className="font-didact text-greydarker text-xl">
                                Consultez la liste des clients, recherchez un compte et accédez aux détails ou à la gestion des profils.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col self-center w-[80%] max-w-[1200px] flex-1 mt-10">
                        <div className="flex justify-between ">
                            <Button
                             size="lg"
                             variant="iconPrimary">
                                <CirclePlus/>
                                Ajouter un <br/>nouveau client
                            </Button>
                            <Input
                             placeholder="Rechercher dans cette liste"
                             leftIcon={
                                <span>
                                    <FontAwesomeIcon icon={faSearch}/>
                                </span>
                             }
                             className="min-w-70 max-w-80"
                            />
                        </div>
                            
                            <List
                            data={projects}
                            columns={projectColums}
                            />
                       {/* <List data={currentProjects} columns={projectColums}/>
                         {totalPages > 1 && (
                            <div className="flex justify-center mt-5">
                                <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                />
                             </div>
                        )} */}
                    </div>
                </main>
            </div>
        </div>
    );
}


// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// import LoginForm from "@/components/forms/LoginForm";

// type LoginFormInputs = {
//     email: string;
//     password: string;
// };

// export default function LoginPage() {
//     const [isLoading, setIsLoading] = useState(false);
//     const [apiError, setApiError] = useState<string>("");

//     const router = useRouter();
//     const api = axios.create({
//         baseURL: "http://localhost:4000/api/",
//         withCredentials: true,
//     });

//     const onSubmit = (data: LoginFormInputs) => {
//         setIsLoading(true);
//         setApiError("");

//         console.log("login data: ", data);

//         api.post("user/login", {
//             email: data.email,
//             password: data.password,
//         })
//             .then(function (response) {
//                 console.log("Login successful, routerpush");
//                 console.log(response);
//                 // Redirect to the home page after successful login
//                 router.push("/admin"); // TODO: check user role and redirect accordingly
//             })
//             .catch(function (error) {
//                 console.log("Login failed");
//                 console.log(error);
//                 setIsLoading(false);

//                 let errorMessage =
//                     "Echec de la connexion. Veuillez véridier vos identifiants.";

//                 if (error.response?.status == 401) {
//                     errorMessage = "Email ou mot de passe incorrect.";
//                 } else if (error.response?.status == 429) {
//                     errorMessage =
//                         "Trop de tentatives. Veuillez réessayer plus tard.";
//                 } else if (error.response?.status == 500) {
//                     errorMessage =
//                         "Erreur du serveur. Veuillez réessayer plus tard";
//                 } else if (!error.response) {
//                     errorMessage =
//                         "Erreur de connexion. Vérifiez votre connexion internet.";
//                 }

//                 setApiError(errorMessage);
//             });
//     };

//     return (
//         <main className="h-screen w-screen overflow-y-scroll justify-center bg-light flex flex-col items-center">   
//             <section className="w-[25vw] min-w-[350px] bg-white flex flex-col items-center text-dark rounded-xl shadow-500base p-8">
//                 <img
//                     src="/logo-sm.jpeg"
//                     className="rounded-full w-12 h-12"
//                     alt="logo"
//                 />
//                 <h1 className="cursor-default font-oswald font-medium text-2xl my-3">
//                     BIENVENUE
//                 </h1>
//                 <p className="cursor-default font-didact text-center text-greydarker text-lg mb-8">
//                     Entrez vos identifiants pour vous connecter.
//                 </p>

//                 <LoginForm
//                  onSubmit={onSubmit}
//                  isLoading={isLoading}
//                  apiError={apiError}
//                 />
//             </section>
//         </main>
//     );
// }