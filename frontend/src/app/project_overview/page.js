"use client";
import { cn } from "@/utils/utils"
import {
    ChevronRight
} from 'lucide-react';

import { Button } from "@/components/ui"

// Remplace l'interface TypeScript par un objet JavaScript simple
const etapeProjetModel = {
    nom: '',
    completion: '',
    status: '',
};

// Données pour les étapes du projet
const etapesProjet = [
    { nom: 'IDEATION', completion: 'Complétion : 4/4', status: 'Terminé' },
    { nom: 'CONCEPTION', completion: 'Complétion : 0/5', status: 'À faire' },
    { nom: 'PILOTAGE', completion: 'En développement', status: 'En développement' },
    { nom: 'REPORTING', completion: 'Complétion : 0/4', status: 'À faire' },
];

const ProjetLambda = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                

                {/* Étapes de réalisation du projet */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Étapes de réalisation de votre projet</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {etapesProjet.map((etape, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-lg border",
                                    "transition-all duration-300",
                                    "flex flex-col justify-between",
                                    etape.status === 'Terminé'
                                        ? "bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700"
                                        : etape.status === 'En développement'
                                            ? "bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700"
                                            : "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/50",
                                    "shadow-sm"
                                )}
                            >
                                <div className="space-y-2">
                                    <h3 className="text-md font-semibold text-gray-900 dark:text-white">{etape.nom}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{etape.completion}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "mt-4 w-full",
                                        "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300",
                                        "dark:bg-transparent dark:border-blue-500/30",
                                        "hover:bg-blue-50/50 dark:hover:bg-blue-900/50"
                                    )}
                                    onClick={() => { /* Ouvrir l'étape (simulé) */ alert(`Ouverture de l'étape ${etape.nom} (simulé)`); }}
                                >
                                    Ouvrir
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions */}
                <div className="mb-8">
                    <Button
                        variant="default"
                        className={cn(
                            "w-full py-4",
                            "bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold rounded-md",
                            "transition-colors duration-200",
                            "dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-gray-900"
                        )}
                        onClick={() => { /* Afficher les suggestions (simulé) */ alert('Affichage des suggestions (simulé)'); }}
                    >
                        SUGGESTIONS
                    </Button>
                </div>

                {/* Aperçu du planning */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aperçu du planning</h2>
                        <Button
                            variant="link"
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => { /* Voir plus du planning (simulé) */ alert('Voir plus du planning (simulé)'); }}
                        >
                            Voir plus
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                    {/* <Alert variant="default" className="bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Aucune action ou échéance actuellement planifiée</AlertTitle>
                    </Alert> */}
                </div>
            </div>
        </div>
    );
};

export default ProjetLambda;


