import { useState, useEffect } from 'react';
import api_backend from '../api/axiosInstance';

export interface AppConfig {
  subtitles: Record<string, string>;
  labels: Record<string, string>;
  types: Record<string, string[]>;
  [key: string]: any; // Permet d'ajouter d'autres sections dynamiquement
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
  labels: {
    todoList: "Tâches à faire",
    actionList: "Actions planifiées"
  },
  types: {
    secteur_clients: [],
    projets: [],
    juridiques_clients: []
  }
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
      } catch (err: any) {
        console.error('Erreur lors du chargement de la configuration:', err);
        setError(err.message);
        // Keep using DEFAULT_CONFIG on error
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};
