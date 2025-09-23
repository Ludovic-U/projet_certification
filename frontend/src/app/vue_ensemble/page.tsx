"use client";

import { PageHeader, Button, Card } from "@/components/ui";

export default function VueEnsemblePage() {
    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Projet Lambda" description="Etapes de réalisation de votre projet"/>
            <section className="flex-1 flex flex-col items-center gap-10">

                <div className="bg-white flex justify-evenly rounded-xl gap-20 py-10 px-10">
                    <div className="flex flex-col justify-between">
                        <div className="flex flex-col gap-3">
                            <h2 className="font-oswald text-primary text-4xl">Tâches à réaliser</h2>
                            <p className="font-noto text-greydarker text-lg">Aucune action ou échéance actuellement planifiée.</p>
                        </div>
                        <Button variant="secondary" className="text-xl">Voir le planning</Button>
                    </div>
                    <img src="/LogoGreen.jpg" alt="" />
                </div>

                <div className="flex items-center gap-8">
                    <Card
                     title="IDEATION"
                     description="Générer et structurer les idées initiales."
                     buttonLabel="Ouvrir"
                     color="#B6CBBF"
                     progress={80}
                    />
                    <Card
                     title="CONCEPTION"
                     description="Définir et planifier les solutions."
                     buttonLabel="Ouvrir"
                     color="#83A18F"
                     progress={30}
                    />
                    <Card
                     title="PILOTAGE"
                     description="Suivre l'avancement et coordonner l'équipe."
                     buttonLabel="Ouvrir"
                     color="#74966E"
                     progress={60}
                    />
                    <Card
                     title="REPORTING"
                     description="Analyser les résultats et partager les bilans."
                     buttonLabel="Ouvrir"
                     color="#577153"
                     progress={20}
                    />
                </div>

                <div>

                </div>


            </section>
        </div>
    );
}