"use client";

import { PageHeader, Button, Card } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { useLocalStorage } from "@/context/LocalStorageContext";

export default function VueEnsemblePage() {
    const router = useRouter();
    const { data, setItem, removeItem } = useLocalStorage();

    const params = useParams(); // A remplacer par les vrais params

    return (
        <div className="h-full flex flex-col">
            <PageHeader title= {"Projet "  + (data?.projectName ?? "")} description="Etapes de réalisation de votre projet"/>            <section className="flex-1 flex flex-col items-center justify-evenly">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <Card
                     title="IDEATION"
                     description="Générer et structurer les idées initiales."
                     buttonLabel="Ouvrir"
                     color="#B6CBBF"
                     progress={80}
                     onButtonClick={() => router.push(`/${params.clientId}/${params.projectId}/ideation`)}
                    />
                    <Card
                     title="CONCEPTION"
                     description="Définir et planifier les solutions."
                     buttonLabel="Ouvrir"
                     color="#83A18F"
                     progress={30}
                     onButtonClick={() => router.push(`/${params.clientId}/${params.projectId}/conception`)}
                    />
                    <Card
                     title="PILOTAGE"
                     description="Suivre l'avancement et coordonner l'équipe."
                     buttonLabel="Ouvrir"
                     color="#74966E"
                     progress={60}
                     onButtonClick={() => router.push(`/${params.clientId}/${params.projectId}/pilotage`)}
                    />

                    <Card
                     title="REPORTING"
                     description="Analyser les résultats et partager les bilans."
                     buttonLabel="Ouvrir"
                     color="#577153"
                     progress={20}
                     onButtonClick={() => router.push(`/${params.clientId}/${params.projectId}/reporting`)}
                    />
                </div>

                <div className="bg-white hidden md:flex rounded-xl gap-30 p-10">
                    <div className="flex flex-col justify-between">
                        <div className="flex flex-col gap-3">
                            <h2 className="font-oswald text-primary text-4xl">Tâches à réaliser</h2>
                            <p className="font-noto text-greydarker text-lg">Aucune action ou échéance actuellement planifiée.</p>
                        </div>
                        <Button className="text-xl">Voir le planning</Button>
                    </div>
                    <img src="/LogoGreen.jpg" alt="" />
                </div>
            </section>
        </div>
    );
}