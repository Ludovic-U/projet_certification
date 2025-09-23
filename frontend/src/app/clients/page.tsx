"use client";

import { useState } from "react";

import {
    PageHeader,
    Button,
    Table,
    TableResponsive,
    Input,
    Pagination,
    clientsList,
 } from "@/components/ui";
 import { FontAwesomeIcon, Icons, CirclePlus } from "@/lib/icons";

export default function ClientsPage() {
    const clients = [
        {id : 1, name: "Entreprise Alpha", sector: "Finance", contact: "Jean Dupont"},
        { id: 2, name: "Startup Beta", sector: "Tech", contact: "Alice Martin" },
        { id: 3, name: "Agence Gamma", sector: "Marketing", contact: "Paul Durand" },
        { id: 4, name: "Société Delta", sector: "Industrie", contact: "Emma Leroy" },
        { id: 5, name: "Entreprise Epsilon", sector: "Santé", contact: "Lucas Bernard" },
        { id: 6, name: "Startup Zeta", sector: "Éducation", contact: "Clara Dubois" },
    ]

    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const currentData = clients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="h-full">
            <PageHeader title="Liste des clients" description="Consultez la liste des clients et accèdez aux détails."/>
            <section className="flex flex-col">
                {/* <div className="w-[90%] self-center flex items-center justify-between">
                    <Button>
                        <CirclePlus/>
                        Ajouter un <br />nouveau client
                    </Button>
                    <Input
                     placeholder="Rechercher un client"
                     leftIcon={
                        <span>
                            <FontAwesomeIcon icon={Icons.search}/>
                        </span>
                     }/>
                </div> */}

                <TableResponsive<typeof currentData[0]>
                 data={currentData}
                 columns={clientsList}/>      

                <Table<typeof currentData[0]>
                 data={currentData}
                 columns={clientsList}/>
                 {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                        <Pagination
                         currentPage={currentPage}
                         totalPages={totalPages}
                         onPageChange={setCurrentPage}/>
                    </div>
                 )}
            </section>
        </div>
    );
}