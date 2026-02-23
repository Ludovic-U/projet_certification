"use client";

import { useState, useEffect } from "react";
import api_backend from "@/api/axiosInstance";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";

interface PromptConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

interface Prompts {
  mindmap?: PromptConfig;
  gantt?: PromptConfig;
}

// Default formats (read-only, not editable by users)
const defaultMindmapFormat = `{
    "nodes": [
        {
            "id": "root",
            "label": "Nom du projet",
            "nodeType": "action",
            "color": "#3b82f6"
        },
        {
            "id": "node-1",
            "parentId": "root",
            "label": "Titre de la catégorie",
            "nodeType": "action",
            "color": "#96776e"
        },
        {
            "id": "node-1-1",
            "parentId": "node-1",
            "label": "Sous-catégorie",
            "nodeType": "sous_action",
            "color": "#698063"
        }
    ]
}`;

const defaultGanttFormat = `{
    "Gantt": [
        {
            "id": 0,
            "title": "Nom de la tâche",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD",
            "progress_percent": 0,
            "parent_id": null,
            "type": "action|sous-action|milestone",
            "description": "Description",
            "note": "Note",
            "assignees": [],
            "expenses": [],
            "deliverables": []
        }
    ]
}`;

// Fixed parts that are automatically added (non-editable)
const mindmapFixedParts = [
  "À partir de ces réponses aux questions, génère une structure de carte mentale (mindmap) organisée de manière hiérarchique.",
  "Le format attendu est le JSON suivant.",
  "{fmt}",
  "Règles:",
  "- Le premier nœud (root) doit être le nom du projet ou thème principal",
  "- Ne pas inclure la durée (timeline) ou le budget dans le mindmap - ces informations seront gérées séparément",
  "- Un livrable est un fichier attendu de la part de l'utilisateur (facture, schéma, preuve, document, etc.)",
  "- Organise les réponses en catégories logiques",
  "- Utilise les types de nœuds: \"action\" pour les catégories principales, \"sous_action\" pour les sous-catégories, \"livrable\" pour les livrables, \"objectif\" pour les objectifs",
  "- Les couleurs recommandées: #3b82f6 (bleu) pour root, #96776e (marron) pour action, #698063 (vert) pour sous_action, #22c55e (vert clair) pour livrable, #ffffff (blanc) pour objectif",
  "- Génère un JSON valide sans texte supplémentaire",
];

const ganttFixedParts = [
  "Analyse ce contenu et à partir des information pertinentes que tu y trouveras, retourne un objet JSON qui servira à créer un Gantt.",
  "{text}",
  "Le format attendu pour le Gantt est le JSON suivant.",
  "{fmt}",
  "Assure toi que le JSON retourné est valide et respecte bien le format demandé.",
];

// Default prompts
function buildFullMindmapPrompt(userPart: string): string {
  return `À partir de ces réponses aux questions, génère une structure de carte mentale (mindmap) organisée de manière hiérarchique.
Le format attendu est le JSON suivant.
{fmt}

Règles:
- Le premier nœud (root) doit être le nom du projet ou thème principal
- Ne pas inclure la durée (timeline) ou le budget dans le mindmap - ces informations seront gérées séparément
- Un livrable est un fichier attendu de la part de l'utilisateur (facture, schéma, preuve, document, etc.)
- Organise les réponses en catégories logiques
- Utilise les types de nœuds: "action" pour les catégories principales, "sous_action" pour les sous-catégories, "livrable" pour les livrables, "objectif" pour les objectifs
- Les couleurs recommandées: #3b82f6 (bleu) pour root, #96776e (marron) pour action, #698063 (vert) pour sous_action, #22c55e (vert clair) pour livrable, #ffffff (blanc) pour objectif
- Génère un JSON valide sans texte supplémentaire

${userPart}`;
}

function buildFullGanttPrompt(userPart: string): string {
  return `Analyse ce contenu et à partir des information pertinentes que tu y trouveras, retourne un objet JSON qui servira à créer un Gantt.
{text}
Le format attendu pour le Gantt est le JSON suivant.
{fmt}
Assure toi que le JSON retourné est valide et respecte bien le format demandé.

${userPart}`;
}

function extractUserPart(fullPrompt: string, fixedParts: string[]): string {
  let userPart = fullPrompt;
  
  // Remove all fixed parts
  for (const part of fixedParts) {
    userPart = userPart.replace(part, '');
  }
  
  // Clean up extra whitespace and newlines
  userPart = userPart.replace(/\n{3,}/g, '\n\n').trim();
  
  return userPart;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompts>({});
  const [userMindmapPart, setUserMindmapPart] = useState("");
  const [userGanttPart, setUserGanttPart] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("mindmap");

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      setLoading(true);
      const response = await api_backend.get("/config/prompts");
      const fetchedPrompts = response.data || {};
      
      // Extract user-editable parts from the full prompts
      if (fetchedPrompts.mindmap?.systemPrompt) {
        setUserMindmapPart(extractUserPart(fetchedPrompts.mindmap.systemPrompt, mindmapFixedParts));
      }
      if (fetchedPrompts.gantt?.systemPrompt) {
        setUserGanttPart(extractUserPart(fetchedPrompts.gantt.systemPrompt, ganttFixedParts));
      }
      
      setPrompts(fetchedPrompts);
    } catch (error: any) {
      console.error("Error fetching prompts:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors du chargement des prompts",
      });
    } finally {
      setLoading(false);
    }
  }

  async function savePrompts() {
    try {
      setSaving(true);
      setMessage(null);
      
      // Build full prompts with fixed parts + user part
      const promptsToSave = {
        mindmap: {
          name: prompts.mindmap?.name || "Génération de Mindmap",
          description: prompts.mindmap?.description || "Prompt utilisé pour générer un mindmap à partir des réponses aux questions",
          systemPrompt: buildFullMindmapPrompt(userMindmapPart),
        },
        gantt: {
          name: prompts.gantt?.name || "Génération de Gantt",
          description: prompts.gantt?.description || "Prompt utilisé pour générer un diagramme de Gantt à partir de contenu texte",
          systemPrompt: buildFullGanttPrompt(userGanttPart),
        },
      };
      
      await api_backend.put("/config/prompts", promptsToSave);
      setMessage({ type: "success", text: "Prompts enregistrés avec succès!" });
    } catch (error: any) {
      console.error("Error saving prompts:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erreur lors de l'enregistrement des prompts",
      });
    } finally {
      setSaving(false);
    }
  }

  function updatePrompt(key: keyof Prompts, field: keyof PromptConfig, value: string) {
    setPrompts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      } as PromptConfig,
    }));
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  function resetToDefaults() {
    setPrompts({
      mindmap: {
        name: "Génération de Mindmap",
        description: "Prompt utilisé pour générer un mindmap à partir des réponses aux questions",
        systemPrompt: buildFullMindmapPrompt(""),
      },
      gantt: {
        name: "Génération de Gantt",
        description: "Prompt utilisé pour générer un diagramme de Gantt à partir de contenu texte",
        systemPrompt: buildFullGanttPrompt(""),
      },
    });
    setUserMindmapPart("");
    setUserGanttPart("");
    setMessage({ type: "success", text: "Prompts réinitialisés aux valeurs par défaut!" });
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Configuration des Prompts IA"
        description="Ajustez les instructions personnalisées utilisées par Mistral AI. Les parties fixes sont automatiquement gérées."
      />

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-900/50 border border-green-700 text-green-300"
              : "bg-red-900/50 border border-red-700 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm"
        >
          Réinitialiser par défaut
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Mindmap Section */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("mindmap")}
            className="w-full p-4 flex items-center justify-between bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-semibold text-white">
                {prompts.mindmap?.name || "Génération de Mindmap"}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === "mindmap" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === "mindmap" && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={prompts.mindmap?.description || ""}
                  onChange={(e) => updatePrompt("mindmap", "description", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Instructions personnalisées
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Ajoutez vos instructions personnalisées ci-dessous. Le reste du prompt est automatiquement géré.
                </p>
                <textarea
                  value={userMindmapPart}
                  onChange={(e) => setUserMindmapPart(e.target.value)}
                  rows={6}
                  placeholder="Ajoutez vos instructions personnalisées ici..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Format JSON (lecture seule)
                </label>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                    {defaultMindmapFormat}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gantt Section */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("gantt")}
            className="w-full p-4 flex items-center justify-between bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-semibold text-white">
                {prompts.gantt?.name || "Génération de Gantt"}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === "gantt" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === "gantt" && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={prompts.gantt?.description || ""}
                  onChange={(e) => updatePrompt("gantt", "description", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Instructions personnalisées
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Ajoutez vos instructions personnalisées ci-dessous. Le reste du prompt est automatiquement géré.
                </p>
                <textarea
                  value={userGanttPart}
                  onChange={(e) => setUserGanttPart(e.target.value)}
                  rows={6}
                  placeholder="Ajoutez vos instructions personnalisées ici..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Format JSON (lecture seule)
                </label>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                    {defaultGanttFormat}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={savePrompts}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer les Prompts"}
        </Button>
      </div>
    </div>
  );
}
