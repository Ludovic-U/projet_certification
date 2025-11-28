"use client";

import { useEffect, useState } from "react";
import {
    PageHeader,
    Button,
    Table,
    Input,
    Pagination,
    projectsList,
    TableResponsive,
    Tooltip,
    Modal
 } from "@/components/ui";
import CreateProjectForm from "@/components/forms/CreateProject";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { useModal } from "@/hooks";
import { useParams, useRouter } from "next/navigation";
import api_backend from "@/api/axiosInstance";
import { useLocalStorage } from "@/context/LocalStorageContext";

import { useConfig } from '@/context/ConfigContext';
export default function ProjectsPage() {
    
    const { config } = useConfig();

    const params = useParams();
    const router = useRouter();
    const modal = useModal();
    const { data, setItem, removeItem } = useLocalStorage();

    const [projects, setProjects] = useState<any[]>([]);

    const fetchProjects = () => {
        api_backend.get(`/project/getByClientId/${params.clientId}`)
            .then(res => {
                setProjects(res.data);
                console.log("projects", res.data);
            })
            .catch(err => {
                console.error("Error fetching projects:", err);
                setProjects([]);
            });
    }

    
    useEffect(() => {
        fetchProjects();
    }, []);

    const handleRowClick = (project: any) => {
        // Met à jour le contexte utilisateur avec le projet sélectionné
       
        setItem("projectName", project.projectName);
        // Redirige vers la page du projet
        router.push(`/${params.clientId}/${project.projectId}/vue_ensemble`);
    };

    
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const currentData = projects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    return (
        <div className="h-full">
            <PageHeader title="Liste des projets" description={config?.subtitles.projectList}/>
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <Tooltip content="Ajouter un projet" position="rightBottom">
                            <Button
                            onClick={modal.openModal}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouveau projet
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title="AJOUTER UN PROJET"
                        description="Entrez les informations du nouveau projet">
                            <CreateProjectForm onSubmit={(formData) => {
                                    // Handle form submission logic here
                                    // Example: send formData to backend and refresh users list
                                    api_backend.post('/project/create', { ...formData, clientId: params.clientId })
                                        .then(response => {
                                            modal.closeModal();
                                            fetchProjects(); // ou router.refresh()
                                        })
                                }}
                                isLoading={false}/>
                        </Modal>
                    </div>

                    <Input
                     type="search"
                     leftIcon={<FontAwesomeIcon icon={Icons.search}/>}
                     placeholder="Recherchez dans cette liste..."
                     className="w-70"/>
                </div>

                <TableResponsive<any>
                 data={currentData}
                 columns={projectsList}
                 onRowClick={(project) => handleRowClick(project)}/>

                <Table<any>
                 data={currentData}
                 columns={projectsList}
                 onRowClick={(project) => handleRowClick(project)}/>
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