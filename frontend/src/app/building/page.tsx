"use client";

import { PageHeader, TableResponsive, clientsList} from "@/components/ui";
import React from "react";
import { useState } from "react";

export default function BuildingPage() {
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
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="bg-light flex flex-col gap-5 p-8 items-center">
                <TableResponsive
                 data={currentData}
                 columns={clientsList}/>
            </section>
        </div>
    );
}