"use client";
import React, { useState } from 'react';
import { Label } from "@/components/ui/old/label"
import { ArrowLeft, LogOut } from 'lucide-react';
import { cn } from "@/utils/utils";

import {
  Button,
  Input
} from "@/components/ui";

const CreerNouveauProjet = () => {
  const [nomProjet, setNomProjet] = useState('');
  const [typeProjet, setTypeProjet] = useState('');
  const [chefProjet, setChefProjet] = useState('');

  const handleSubmit = () => {
    console.log('Nom du projet:', nomProjet);
    console.log('Type de projet:', typeProjet);
    console.log('Chef de projet:', chefProjet);
    //  ici mettre API pour envoyer les données au serveur
    alert(`Projet "${nomProjet}" créé ! (Ceci est une démo)`); // Keep it simple for demo
    // Réinitialiser les champs après la soumission 
    setNomProjet('');
    setTypeProjet('');
    setChefProjet('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-10 border border-gray-200 dark:border-gray-700">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => { /* Retour à la page précédente (simulé) */ alert('Retour à la page précédente (simulé)'); }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Créer un nouveau projet</h1>
          </div>
          <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 flex items-center gap-2"
              onClick={() => { /* Déconnexion (simulé) */ alert('Déconnexion (simulé)'); }}
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>

        {/* Formulaire de création de projet */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="nom-projet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom du projet
            </Label>
            <Input
              id="nom-projet"
              type="text"
              value={nomProjet}
              onChange={(e) => setNomProjet(e.target.value)}
              placeholder="Entrez le nom du projet"
              className={cn(
                "mt-1",
                "border-gray-300 dark:border-gray-600",
                "focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-700 dark:text-white",
                "dark:focus:ring-blue-400 dark:focus:border-blue-400"
              )}
            />
          </div>
          <div>
            <Label htmlFor="type-projet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type de projet (AAP, etc.)
            </Label>
            <Input
              id="type-projet"
              type="text"
              value={typeProjet}
              onChange={(e) => setTypeProjet(e.target.value)}
              placeholder="Entrez le type de projet"
              className={cn(
                "mt-1",
                "border-gray-300 dark:border-gray-600",
                "focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-700 dark:text-white",
                "dark:focus:ring-blue-400 dark:focus:border-blue-400"
              )}
            />
          </div>
          <div>
            <Label htmlFor="chef-projet" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assigner un chef de projet
            </Label>
            <Input
              id="chef-projet"
              type="text"
              value={chefProjet}
              onChange={(e) => setChefProjet(e.target.value)}
              placeholder="Entrez le nom du chef de projet"
              className={cn(
                "mt-1",
                "border-gray-300 dark:border-gray-600",
                "focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-700 dark:text-white",
                "dark:focus:ring-blue-400 dark:focus:border-blue-400"
              )}
            />
          </div>
        </div>

        {/* Bouton de création */}
        <div className="mt-8">
          <Button
            onClick={handleSubmit}
            className={cn(
              "w-full",
              "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded",
              "focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
              "transition-colors duration-200",
              "dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-500"
            )}
          >
            Créer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreerNouveauProjet;
