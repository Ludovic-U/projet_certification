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
    Tooltip,
    Modal
} from "@/components/ui";
import CreateClientForm from "@/components/forms/CreateClient";

import { useModal } from "@/hooks";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export default function ClientsPage() {
    const modal = useModal()
    const clients = [
        {id : 1, name: "Entreprise Alpha", sector: "Finance", contact: "Jean Dupont"},
        { id: 2, name: "Startup Beta", sector: "Tech", contact: "Alice Martin" },
        { id: 3, name: "Agence Gamma", sector: "Marketing", contact: "Paul Durand" },
        { id: 4, name: "Société Delta", sector: "Industrie", contact: "Emma Leroy" },
        { id: 5, name: "Entreprise Epsilon", sector: "Santé", contact: "Lucas Bernard" },
        { id: 6, name: "Startup Zeta", sector: "Éducation", contact: "Clara Dubois" },
        {id : 7, name: "Entreprise Alpha", sector: "Finance", contact: "Jean Dupont"},
        { id: 8, name: "Startup Beta", sector: "Tech", contact: "Alice Martin" },
        { id: 9, name: "Agence Gamma", sector: "Marketing", contact: "Paul Durand" },
        { id: 10, name: "Société Delta", sector: "Industrie", contact: "Emma Leroy" },
        { id: 11, name: "Entreprise Epsilon", sector: "Santé", contact: "Lucas Bernard" },
        { id: 12, name: "Startup Zeta", sector: "Éducation", contact: "Clara Dubois" },
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
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between"> 
                    <div>
                        <Tooltip content="Ajouter un client" position="rightBottom">
                            <Button
                            onClick={modal.openModal}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouveau client
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title="AJOUTER UN CLIENT"
                        description="Entrez les informations du nouveau client">
                            <CreateClientForm/>
                        </Modal>
                    </div>
                    <Input
                     type="search"
                     leftIcon={<FontAwesomeIcon icon={Icons.search}/>}
                     placeholder="Recherchez dans cette liste..."
                     className="w-70"/>
                </div>
                
                {/* <TableResponsive<typeof currentData[0]>
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
                 )} */}
            </section>
        </div>
    );
}