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
    const [clientName, setClientName] = useState<string>("");
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [apiError, setApiError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchClient = () => {
        api_backend.get(`/client/getById/${params.clientId}`)
            .then(res => {
                setClientName(res.data.clientName);
                setItem("clientName", res.data.clientName);
                setItem("clientId", res.data.clientId);
            })
            .catch(err => {
                console.error("Error fetching client:", err);
            });
    }

    
    useEffect(() => {
        fetchProjects();
        fetchClient();
    }, []);

    const handleRowClick = (project: any) => {
        // Met à jour le contexte utilisateur avec le projet sélectionné
       
        setItem("projectName", project.projectName);
        setItem("projectId", project.projectId);
        // Redirige vers la page du projet
        router.push(`/${params.clientId}/${project.projectId}/vue_ensemble`);
    };

    const handleEditProject = (project: any, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedProject(project);
        setApiError("");
        modal.openModal();
    };

    const handleAddProject = () => {
        setSelectedProject(null);
        setApiError("");
        modal.openModal();
    };

    const handleModalClose = () => {
        setSelectedProject(null);
        setApiError("");
        modal.closeModal();
    };

    const getApiErrorMessage = (error: any) => {
        return error?.response?.data?.error || "Une erreur est survenue. Veuillez réessayer.";
    };

    const handleSubmitProject = async (formData: any) => {
        setApiError("");
        setIsLoading(true);

        try {
            if (selectedProject) {
                await api_backend.put(`/project/${selectedProject.projectId}`, {
                    ...formData,
                    clientId: params.clientId,
                });
            } else {
                await api_backend.post('/project/create', {
                    ...formData,
                    clientId: params.clientId,
                });
            }

            handleModalClose();
            fetchProjects();
        } catch (error: any) {
            setApiError(getApiErrorMessage(error));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;
        
        setApiError("");
        setIsLoading(true);

        try {
            await api_backend.delete(`/project/${selectedProject.projectId}`);
            handleModalClose();
            fetchProjects();
        } catch (error: any) {
            setApiError(getApiErrorMessage(error));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
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
            <PageHeader 
                title={clientName ? `${clientName} - Liste des projets` : "Liste des projets"} 
                description={config?.subtitles.projectList}
                helpKey="projectList"
            />
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <Tooltip content="Ajouter un projet" position="rightBottom">
                            <Button
                            onClick={handleAddProject}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouveau projet
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title={selectedProject ? "MODIFIER LE PROJET" : "AJOUTER UN PROJET"}
                        description={selectedProject ? "Modifiez les informations du projet" : "Entrez les informations du nouveau projet"}>
                            <CreateProjectForm 
                                clientId={Number(params.clientId)}
                                initialData={selectedProject}
                                onSubmit={handleSubmitProject}
                                onDelete={selectedProject ? handleDeleteProject : undefined}
                                isLoading={isLoading}
                                apiError={apiError}/>
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
                 onRowClick={(project) => handleRowClick(project)}
                 onEditClick={(project, event) => handleEditProject(project, event)}/>

                <Table<any>
                 data={currentData}
                 columns={projectsList}
                 onRowClick={(project) => handleRowClick(project)}
                 onEditClick={(project, event) => handleEditProject(project, event)}/>
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