"use client";

import { useState, useEffect } from "react";
import {
    PageHeader,
    Button,
    Table,
    TableResponsive,
    Input,
    Pagination,
    Tooltip,
    Modal,
} from "@/components/ui";
import CreateFinanceurForm from "@/components/forms/CreateFinanceur"; // <-- adapte si le fichier a un autre nom
import { useModal } from "@/hooks";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import api_backend from "@/api/axiosInstance";
import { useRouter } from "next/navigation";

export default function FinanceursPage() {
    const router = useRouter();
    const modal = useModal();

    const [financeurs, setFinanceurs] = useState<any[]>([]);
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);

    const fetchFinanceurs = () => {
        api_backend.get('/financeur')
            .then(res => {
                const data = res.data;
                setFinanceurs(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Error fetching financeurs:", err);
                setFinanceurs([]);
            });
    };

    useEffect(() => {
        fetchFinanceurs();
    }, []);
    const safeFinanceurs = Array.isArray(financeurs) ? financeurs : [];
    const totalPages = Math.max(1, Math.ceil(safeFinanceurs.length / itemsPerPage));
    const currentData = safeFinanceurs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="h-full">
            <PageHeader title="Liste des financeurs" description="Consultez la liste des financeurs et leurs détails."/>
            <section>
                <div className="flex items-center justify-between">
                    <div>
                        <Tooltip content="Ajouter un financeur" position="rightBottom">
                            <Button onClick={modal.openModal} size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouveau financeur
                            </Button>
                        </Tooltip>

                        <Modal modal={modal}
                               title="AJOUTER UN FINANCEUR"
                               description="Entrez les informations du nouveau financeur">
                            <CreateFinanceurForm
                                onSubmit={(formData) => {
                                    api_backend.post('/financeur', { ...formData })
                                        .then(() => {
                                            modal.closeModal();
                                            fetchFinanceurs(); // update list locally
                                        })
                                        .catch(err => {
                                            console.error("Error creating financeur:", err);
                                        });
                                }}
                                isLoading={false}
                            />
                        </Modal>
                    </div>

                    <Input
                        type="search"
                        leftIcon={<FontAwesomeIcon icon={Icons.search}/>}
                        placeholder="Recherchez dans cette liste..."
                        className="w-70"
                    />
                </div>
                <TableResponsive<any>
                    data={currentData}
                    columns={/* financeursList */ [] as any} // <- remplace par la constante de colonnes appropriée
                    onRowClick={(financeur) => router.push(`/financeurs/${financeur.financeurId}`)}
                />

                <Table<any>
                    data={currentData}
                    columns={/* financeursList */ [] as any} // <- remplace par la constante de colonnes appropriée
                    onRowClick={(financeur) => router.push(`/financeurs/${financeur.financeurId}`)}
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
            </section>
        </div>
    );
}