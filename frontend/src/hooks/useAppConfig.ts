import { useState, useEffect } from 'react';
import api_backend from '../api/axiosInstance';

export interface HelpDictionaryEntry {
  term: string;
  definition: string;
}

export interface AppConfig {
  subtitles: Record<string, string>;
  headers: Record<string, HelpDictionaryEntry[]>;
  labels: Record<string, string>;
  types: Record<string, string[]>;
  prompts: Record<string, Record<string, string>>;
  [key: string]: unknown;
}

// Default fallback values
const DEFAULT_CONFIG: AppConfig = {
  subtitles: {
    projectList: "Liste des projets",
    overview: "Vue d'ensemble du projet",
    ideation: "Phase d'idéation",
    conception: "Phase de conception",
    pilotage: "Pilotage du projet",
    evaluation: "Évaluation",
    reporting: "Reporting"
  },
  headers: {
    projectList: [{ term: 'Projet', definition: 'Un projet est un ensemble d activités temporaires entreprises pour créer un produit, service ou résultat unique.' }],
    overview: [{ term: 'Vue d\'ensemble', definition: 'La vue d\'ensemble summarize l\'état actuel du projet et ses principales métriques.' }],
    ideation: [{ term: 'Idéation', definition: 'Phase de brainstorming pour générer des idées et définir les besoins du projet.' }],
    conception: [{ term: 'Conception', definition: 'Phase de planification détaillée incluant la définition des tâches, ressources et délais.' }],
    pilotage: [{ term: 'Pilotage', definition: 'Phase de suivi et contrôle de l\'avancement du projet.' }],
    evaluation: [{ term: 'Évaluation', definition: 'Phase de mesure des résultats et analyse des performances du projet.' }],
    reporting: [{ term: 'Reporting', definition: 'Génération de rapports et tableaux de bord pour le suivi du projet.' }]
  },
  labels: {
    todoList: "Tâches à faire",
    actionList: "Actions planifiées"
  },
  types: {
    secteur_clients: [],
    projets: [],
    juridiques_clients: []
  },
  prompts: {}
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api_backend.get('/config');
        setConfig(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep using DEFAULT_CONFIG on error
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};
