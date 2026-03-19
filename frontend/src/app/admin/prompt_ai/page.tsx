"use client";

import { useState, useEffect } from "react";
import api_backend from "@/api/axiosInstance";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/Button/Button";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

interface PromptConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

interface Prompts {
  mindmap?: PromptConfig;
  gantt?: PromptConfig;
  ideation?: PromptConfig;
}

export default function PromptAiConfigPage() {
  const { user } = useUser();
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check authorization on mount - redirect if not super_admin
  useEffect(() => {
    if (user && !user.roles?.includes("super_admin")) {
      router.push("/");
    }
  }, [user]);

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

  function updatePrompt(field: keyof PromptConfig, value: string) {
    setPrompts((prev) => ({
      ...prev,
      ideation: {
        ...(prev.ideation || {
          name: "Chatbot d'Idéation",
          description:
            "Prompt utilisé par le chatbot d'idéation pour guider la collecte d'informations et la création de réponses structurées.",
          systemPrompt: "",
        }),
        [field]: value,
      },
    }));
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
        title="Configuration du prompt IA (Idéation)"
        description="Modifiez le prompt utilisé par le chatbot d'idéation. Ce texte est injecté avant l'historique et les questions disponibles."
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
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom du prompt
              </label>
              <input
                type="text"
                value={prompts.ideation?.name || ""}
                onChange={(e) => updatePrompt("name", e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={prompts.ideation?.description || ""}
                onChange={(e) => updatePrompt("description", e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prompt système
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Ce texte est injecté avant l'historique de conversation et la liste des questions disponibles. Gardez le format JSON attendu et la structure des actions.
              </p>
              <textarea
                value={prompts.ideation?.systemPrompt || ""}
                onChange={(e) => updatePrompt("systemPrompt", e.target.value)}
                rows={12}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={savePrompts}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer le prompt"}
        </Button>
      </div>
    </div>
  );
}
