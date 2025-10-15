"use client";

import {
    PageHeader,
    Tooltip,
    Modal,
    Button,
    Input,
    TableResponsive,
    Table,
    Pagination
} from "@/components/ui";
import { User, usersList } from "@/components/ui/Table/table.variants/users";
import CreateUserForm from "@/components/forms/CreateUser"
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks";
import { useState, useEffect } from "react";
import api_backend from "@/api/axiosInstance";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export default function UsersPage() {
    const router = useRouter();
    const modal = useModal();

    const [users, setUsers] = useState<any[]>([]);
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const params = useParams();

    useEffect(() => {
        api_backend.get(`/user/by-client/${params.clientId}`)
            .then(res => {
                setUsers(res.data);
                console.log("users", res.data);
            })
            .catch(err => {
                console.error("Error fetching users:", err);
                setUsers([]);
            });
    }, []);

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const currentData = users.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="h-full">
            <PageHeader title="Liste des contributeurs" description="Consultez la liste des contributeurs et accèdez aux détails" />
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <Tooltip content="Ajouter un projet" position="rightBottom">
                            <Button
                                onClick={modal.openModal}
                                size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus} />
                                </div>
                                Nouvel utilisateur
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                            title="ajouter un utilisateur"
                            description="Entrez les informations du nouvel utilisateur">
                            <CreateUserForm
                                onSubmit={(formData) => {
                                    // Handle form submission logic here
                                    // Example: send formData to backend and refresh users list
                                    api_backend.post('/user/register', { ...formData, clientId: params.clientId })
                                        .then(response => {
                                            // reload page
                                            router.refresh;
                                        })
                                }}
                                isLoading={false}
                            />
                        </Modal>
                    </div>
                    <Input
                        type="search"
                        leftIcon={<FontAwesomeIcon icon={Icons.search} />}
                        placeholder="Recherchez dans cette liste..."
                        className="w-70" />
                </div>
                <TableResponsive<typeof currentData[0]>
                    data={currentData}
                    columns={usersList}
                    onRowClick={(user) => router.push(`/${params.clientId}/users/${user.userId}`)}
                />

                <Table<typeof currentData[0]>
                    data={currentData}
                    columns={usersList}
                    onRowClick={(user) => router.push(`/${params.clientId}/users/${user.userId}`)} />
                {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage} />
                    </div>
                )}
            </section>
        </div>
    );
}