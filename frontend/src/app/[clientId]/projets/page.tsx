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

export default function ProjectsPage() {
    const params = useParams();
    const router = useRouter();
    const modal = useModal();
    const { data, setItem, removeItem } = useLocalStorage();

    // const projects = [
    //     { id: 1, title: "Projet lamazeazebda", type: "AAP", step:"REPORTING (1/4)", contributors: 12},
    //     { id: 2, title: "Projet lambda", type: "POC", step:"Pilotage (1/4)", contributors: 3},
    //     { id: 3, title: "Projet lamhbda un titre long", type: "MVP", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 4, title: "Projet lambda avec un titre encore plus long", type: "R&D", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 5, title: "Projet lambda je ne pense pas que des titres seront aussi longs mais au cas où", type: "Concours / Challenge", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 6, title: "Projet lambda", type: "Campagne", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 7, title: "Projet lambda", type: "Sprint", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 8, title: "Projet lambda", type: "Concours", step:"IDEATION (1/4)", contributors: 8},
    //     { id: 9, title: "Projet lambda", type: "Programme", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 10, title: "Projet lambda", type: "Initiative", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 11, title: "Projet lambda", type: "Contrat / Prestation", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 12, title: "Projet lambda", type: "Concours / Challenge", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 13, title: "Projet lambda", type: "AAP", step:"PILOTAGE (1/4)", contributors: 3},
    //     { id: 14, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 15, title: "Projet lambda", type: "AAP", step:"REPORTING (1/4)", contributors: 3},
    //     { id: 16, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 17, title: "Projet lambda", type: "AAP", step:"CONCEPTION (1/4)", contributors: 3},
    //     { id: 18, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
    //     { id: 19, title: "Projet lambda", type: "AAP", step:"CONCEPTION (8/10)", contributors: 3},
    //     { id: 20, title: "Projet lambda", type: "AAP", step:"IDEATION (1/4)", contributors: 3},
    // ];

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
            <PageHeader title="Liste des projets" description="Consultez la liste des projets et accèdez aux détails"/>
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

                <TableResponsive<typeof currentData[0]>
                 data={currentData}
                 columns={projectsList}
                 onRowClick={(project) => handleRowClick(project)}/>

                <Table<typeof currentData[0]>
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