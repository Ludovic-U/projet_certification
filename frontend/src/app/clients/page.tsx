// Affichages de la liste des clients

"use client";

import { useState } from "react";

import Header from "@/components/layout/Header"
import { SideNav } from "@/components/layout"
import { FontAwesomeIcon, Icons, CirclePlus } from "@/lib/icons";

import {
    Button,
    List,
    Input,
    Pagination,
    clientsList
} from "@/components/ui"

export default function Home() {
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);

    const clients = [
        {id : 1, name: "Entreprise Alpha", sector: "Finance", contact: "Jean Dupont"},
        { id: 2, name: "Startup Beta", sector: "Tech", contact: "Alice Martin" },
        { id: 3, name: "Agence Gamma", sector: "Marketing", contact: "Paul Durand" },
        { id: 4, name: "Société Delta", sector: "Industrie", contact: "Emma Leroy" },
        { id: 5, name: "Entreprise Epsilon", sector: "Santé", contact: "Lucas Bernard" },
        { id: 6, name: "Startup Zeta", sector: "Éducation", contact: "Clara Dubois" },        
    ];

    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const currentData = clients.slice(
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
                                Liste des clients
                            </h1>
                            <p className="font-didact text-greydarker text-xl">
                                Consultez la liste des clients et accèdez aux détails.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col self-center w-[80%] max-w-[1200px] flex-1">
                        <div className="flex justify-between ">
                            <Button
                             variant="iconPrimary"
                             size="sm">
                                <CirclePlus/>
                                Ajouter un<br/> nouveau client
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
                            columns={clientsList}
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