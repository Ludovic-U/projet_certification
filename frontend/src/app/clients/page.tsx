"use client";

import { useState } from "react";
import { useEffect } from "react";

import {
    PageHeader,
    Button,
    Table,
    TableResponsive,
    Input,
    Pagination,
    clientsList,
    Tooltip,
    Modal,
    Client
} from "@/components/ui";
import CreateClientForm from "@/components/forms/CreateClient";

import { useModal } from "@/hooks";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import api_backend from "@/api/axiosInstance";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
    const router = useRouter();
    const modal = useModal();

    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [apiError, setApiError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);

    const fetchClients = () => {
        api_backend.get('/client/get')
            .then(res => {
                setClients(res.data);
            })
            .catch(err => {
                console.error("Error fetching clients:", err);
                setClients([]);
            }); 
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleEditClient = (client: any, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedClient(client);
        setApiError("");
        modal.openModal();
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setApiError("");
        modal.openModal();
    };

    const handleModalClose = () => {
        setSelectedClient(null);
        setApiError("");
        modal.closeModal();
    };

    const getApiErrorMessage = (error: any) => {
        return error?.response?.data?.error || "Une erreur est survenue. Veuillez réessayer.";
    };

    const handleSubmitClient = async (formData: any) => {
        setApiError("");
        setIsLoading(true);

        try {
            if (selectedClient) {
                await api_backend.put(`/client/${selectedClient.clientId}`, { ...formData });
            } else {
                await api_backend.post('/client/create', { ...formData });
            }

            handleModalClose();
            fetchClients();
        } catch (error: any) {
            setApiError(getApiErrorMessage(error));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const currentData = clients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="h-full">
            <PageHeader title="Liste des clients" description="Consultez la liste des clients et accèdez aux détails." helpKey="projectList"/>
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between"> 
                    <div>
                        <Tooltip content="Ajouter un client" position="rightBottom">
                            <Button
                            onClick={handleAddClient}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouveau client
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title={selectedClient ? "MODIFIER LE CLIENT" : "AJOUTER UN CLIENT"}
                        description={selectedClient ? "Modifiez les informations du client" : "Entrez les informations du nouveau client"}>
                            <CreateClientForm
                                initialData={selectedClient}
                                onSubmit={handleSubmitClient}
                                isLoading={isLoading}
                                apiError={apiError}
                            />
                        </Modal>
                    </div>
                    <Input
                     type="search"
                     leftIcon={<FontAwesomeIcon icon={Icons.search}/>}
                     placeholder="Recherchez dans cette liste..."
                     className="w-70"/>
                </div>
                
                 <TableResponsive<typeof currentData[0]>
                 data={currentData}
                 columns={clientsList}
                 onRowClick={(client) => router.push(`/${client.clientId}/projets`)}
                 onEditClick={(client, event) => handleEditClient(client, event)}
                 />
                 
                <Table<typeof currentData[0]>
                 data={currentData}
                 columns={clientsList}
                 onRowClick={(client) => router.push(`/${client.clientId}/projets`)}
                 onEditClick={(client, event) => handleEditClient(client, event)}/>
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