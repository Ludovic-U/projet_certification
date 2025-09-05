// Affichages différents en fonction du rôle (même contenu que pages clients/page.tsx et projets/page.tsx)

"use client";

import { useState } from "react";

import { FontAwesomeIcon, Icons, CirclePlus } from "@/lib/icons";

import Header from "@/components/layout/Header"
import { SideNav } from "@/components/layout"

import {
    Button,
    Column,
    List,
    Input,
    Pagination,
    Client,
    clientsList,
    Project,
    projectsList
} from "@/components/ui"

export default function Home() {
    const currentUser = { id: 1, name: "Admin", role: "superadmin"};

    const [isSideNavOpen, setIsSideNavOpen] = useState(false);

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
    ];

    const clients = [
        {id : 1, name: "Entreprise Alpha", sector: "Finance", contact: "Jean Dupont"},
        { id: 2, name: "Startup Beta", sector: "Tech", contact: "Alice Martin" },
        { id: 3, name: "Agence Gamma", sector: "Marketing", contact: "Paul Durand" },
        { id: 4, name: "Société Delta", sector: "Industrie", contact: "Emma Leroy" },
        { id: 5, name: "Entreprise Epsilon", sector: "Santé", contact: "Lucas Bernard" },
        { id: 6, name: "Startup Zeta", sector: "Éducation", contact: "Clara Dubois" },        
    ];

    const isSuperAdmin = currentUser.role === "superadmin";

    type RoleListConfig<T> = {
        title: string;
        subtitle: string;
        data: T[];
        columns: Column<T>[];
    };

    type ListConfig =
        | { title: string; subtitle: string, data: Project[]; columns: Column<Project>[] }
        | { title: string, subtitle: string, data: Client[]; columns: Column<Client>[] };

    const listConfig: ListConfig = isSuperAdmin
    ? {
        title: "Liste des clients",
        subtitle: "Consultez la liste des clients et accèdez aux détails.",
        data: clients,
        columns: clientsList,
    }
    : {
        title: "Mes projets",
        subtitle: "Consultez vos projets, recherchez et gérez-les",
        data: projects,
        columns: projectsList
    };

    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(listConfig.data.length / itemsPerPage);
    const currentData = listConfig.data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                                {listConfig.title}
                            </h1>
                            <p className="font-didact text-greydarker text-xl">
                                {listConfig.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col self-center w-[80%] max-w-[1200px] flex-1">
                        <div className="flex justify-between ">
                            <Button
                             variant="iconPrimary"
                             size="sm">
                                <CirclePlus/>
                                {isSuperAdmin
                                    ? <>Ajouter un<br/> nouveau client</>
                                    :  <>Créer un<br/> nouveau projet</>}
                            </Button>
                            <Input
                             placeholder="Rechercher dans cette liste"
                             leftIcon={
                                <span>
                                    <FontAwesomeIcon icon={Icons.search}/>
                                </span>
                             }
                             className="min-w-70 max-w-80"
                            />
                        </div>
                            
                            <List<typeof currentData[0]>
                            data={currentData}
                            columns={listConfig.columns as Column<typeof currentData[0]>[]}
                            />
                         {totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                />
                             </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}