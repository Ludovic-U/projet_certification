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

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompts>({});
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
      setPrompts(response.data || {});
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
      await api_backend.put("/config/prompts", prompts);
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
        description="Gérez les prompts utilisés par Mistral AI pour générer les mindmaps et diagrammes de Gantt"
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

      <div className="mt-6 space-y-4">
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
                  System Prompt
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Utilisez {"{fmt}"} pour insérer le format JSON attendu
                </p>
                <textarea
                  value={prompts.mindmap?.systemPrompt || ""}
                  onChange={(e) => updatePrompt("mindmap", "systemPrompt", e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
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
                  System Prompt
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Utilisez {"{text}"} pour insérer le contenu texte et {"{fmt}"} pour le format JSON
                </p>
                <textarea
                  value={prompts.gantt?.systemPrompt || ""}
                  onChange={(e) => updatePrompt("gantt", "systemPrompt", e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
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
