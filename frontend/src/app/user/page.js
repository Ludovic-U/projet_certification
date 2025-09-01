"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Mail, Lock, Briefcase, Users, ListChecks } from 'lucide-react';
import { cn } from "@/utils/utils"

const roles = ['Directeur', 'Chef de projet', 'Contributeur', 'Trésorier', 'RH'];
const projetsDisponibles = ['Projet Alpha', 'Projet Beta', 'Projet Gamma', 'Projet Delta'];


const ModifierUtilisateur = () => {
  // État pour les données du formulaire
  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    entreprise: '',
    role: '',
    projets: [],
  });
  const [isCreating, setIsCreating] = useState(false); // Pour déterminer si on crée ou modifie

  // État pour la liste des projets sélectionnés
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);


  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleProjectChange = (project) => {
    setSelectedProjects(prevProjects => {
      if (prevProjects.includes(project)) {
        return prevProjects.filter(p => p !== project);
      } else {
        return [...prevProjects, project];
      }
    });
  };

  // Fonction pour gérer la soumission du formulaire
  async function handleSubmit(params){
    // Ici, tu ajouterais la logique pour enregistrer les données de l'utilisateur
    console.log('Données utilisateur:', userData);
    console.log('Projets sélectionnés:', selectedProjects);
    alert(`Utilisateur ${isCreating ? 'créé' : 'modifié'} ! (Ceci est une démo)`);

  };

  useEffect(() => {
    // Simuler la récupération des données de l'utilisateur pour la modification
    // Dans une application réelle, tu récupérerais les données à partir d'une API
    if (!isCreating) {
      // Exemple de données fictives pour un utilisateur existant
      setUserData({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        motDePasse: 'motdepasse123', // Ne jamais afficher le vrai mot de passe en clair !
        entreprise: 'Entreprise B',
        role: 'Utilisateur',
        projets: ['Projet Beta', 'Projet Gamma'],
      });
      setSelectedProjects(['Projet Beta', 'Projet Gamma']);
    }
  }, [isCreating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-10 border border-gray-200 dark:border-gray-700">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isCreating ? 'Créer un utilisateur' : 'Modifier un utilisateur'}
            </h1>
          </div>
        </div>

        {/* Formulaire de création/modification d'utilisateur */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="nom" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Nom
            </Label>
            <Input
              id="nom"
              type="text"
              value={userData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              placeholder="Entrez le nom"
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
            <Label htmlFor="prenom" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Prénom
            </Label>
            <Input
              id="prenom"
              type="text"
              value={userData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              placeholder="Entrez le prénom"
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
            <Label htmlFor="email" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Entrez l'email"
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
            <Label htmlFor="motDePasse" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Mot de passe
            </Label>
            <div className="relative mt-1">
              <Input
                id="motDePasse"
                type={motDePasseVisible ? "text" : "password"}
                value={userData.motDePasse}
                onChange={(e) => handleChange('motDePasse', e.target.value)}
                placeholder={isCreating ? "Entrez le mot de passe" : "Nouveau mot de passe (laisser vide pour conserver l'actuel)"}
                className={cn(
                  "pr-10", // Make space for the icon
                  "border-gray-300 dark:border-gray-600",
                  "focus:ring-blue-500 focus:border-blue-500",
                  "dark:bg-gray-700 dark:text-white",
                  "dark:focus:ring-blue-400 dark:focus:border-blue-400"
                )}
              />
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
                onClick={() => setMotDePasseVisible(!motDePasseVisible)}
                title={motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {motDePasseVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path></svg>
                )}
              </Button>
            </div>

          </div>
          <div>
            <Label htmlFor="role" className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" /> Rôle
            </Label>
            <Select
              value={userData.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger className={cn(
                "mt-1 w-full",
                "border-gray-300 dark:border-gray-600",
                "focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-700 dark:text-white",
                "dark:focus:ring-blue-400 dark:focus:border-blue-400"
              )}>
                <SelectValue placeholder="Sélectionner le rôle" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className=" text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> Projets
            </Label>
            <div className="mt-1 space-y-2">
              {projetsDisponibles.map((projet) => (
                <div key={projet} className="flex items-center">
                  <Input
                    id={`projet-${projet}`}
                    type="checkbox"
                    checked={selectedProjects.includes(projet)}
                    onChange={() => handleProjectChange(projet)}
                    className={cn(
                      "mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-500",
                      "focus:ring-offset-0"
                    )}
                  />
                  <Label htmlFor={`projet-${projet}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {projet}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
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
            {isCreating ? 'Créer un utilisateur' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModifierUtilisateur;

