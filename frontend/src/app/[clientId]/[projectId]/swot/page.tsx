"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import api_backend from "@/api/axiosInstance";

type SwotCategory = "strength" | "weakness" | "opportunity" | "threat";

type ProjectQuestion = {
  questionId: number;
  label: string;
  category?: string | null;
  options?: {
    optionId: number;
    label: string;
  }[];
};

type ProjectResponse = {
  responseId: number;
  questionId: number;
  label?: string | null;
  optionId?: number | null;
};

// Convertit les catégories SWOT (singulier/pluriel, avec/sans accents)
// vers un format canonique utilisé dans l'affichage.
const normalizeSwotCategory = (category?: string | null): SwotCategory | null => {
  if (!category) return null;

  const normalized = category
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized === "force" || normalized === "forces") return "strength";
  if (normalized === "faiblesse" || normalized === "faiblesses") return "weakness";
  if (normalized === "opportunite" || normalized === "opportunites") return "opportunity";
  if (normalized === "menace" || normalized === "menaces") return "threat";

  return null;
};

// Crée un index optionId -> libellé d'option à partir des questions,
// pour retrouver le texte des réponses stockées via optionId.
const buildOptionLabelMap = (questions: ProjectQuestion[]) => {
  const optionLabelMap = new Map<number, string>();

  for (const question of questions) {
    for (const option of question.options ?? []) {
      optionLabelMap.set(option.optionId, option.label);
    }
  }

  return optionLabelMap;
};

// Retourne le texte affichable d'une réponse.
// Priorité: réponse libre (label) puis libellé de l'option sélectionnée.
const getResponseContent = (
  response: ProjectResponse,
  optionLabelMap: Map<number, string>
) => {
  const freeText = response.label?.trim();
  if (freeText) return freeText;

  if (response.optionId) {
    const optionText = optionLabelMap.get(response.optionId)?.trim();
    if (optionText) return optionText;
  }

  return "";
};

// Décompose un texte de réponse en plusieurs valeurs quand la réponse
// a été enregistrée sous forme concaténée (ex: "A, B" ou "A ; B").
// Cela permet d'afficher toutes les réponses d'une question, même si
// le backend a persisté une seule ligne de texte.
const splitResponseValues = (content: string) => {
  return content
    .split(/[,;\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
};

// Construit le texte d'une catégorie SWOT.
// Pour chaque question de la catégorie:
// 1) récupère toutes les réponses liées,
// 2) supprime les doublons,
// 3) concatène les réponses sur une seule ligne.
const buildCategoryText = (
  questions: ProjectQuestion[],
  responses: ProjectResponse[],
  category: SwotCategory
) => {
  const optionLabelMap = buildOptionLabelMap(questions);
  const responsesByQuestion = new Map<number, string[]>();

  // 1) On indexe toutes les réponses par question.
  //    Une même question peut avoir plusieurs enregistrements de réponse.
  for (const response of responses) {
    const content = getResponseContent(response, optionLabelMap);
    if (!content) continue;

    // Si une réponse contient déjà plusieurs valeurs concaténées
    // (ex: "A, B, C"), on les éclate pour les traiter individuellement.
    const values = splitResponseValues(content);

    const questionResponses = responsesByQuestion.get(response.questionId) ?? [];
    questionResponses.push(...values);
    responsesByQuestion.set(response.questionId, questionResponses);
  }

  const lines: string[] = [];

  // 2) On parcourt toutes les questions, puis on garde uniquement
  //    celles de la catégorie SWOT en cours.
  for (const question of questions) {
    if (normalizeSwotCategory(question.category) !== category) continue;

    // 3) On récupère toutes les réponses associées à la question.
    //    Si aucune réponse, on n'affiche pas la question.
    const questionResponses = responsesByQuestion.get(question.questionId) ?? [];
    if (questionResponses.length === 0) continue;

    // 4) On déduplique puis on concatène pour afficher clairement
    //    toutes les réponses liées à cette question.
    const uniqueResponses = [...new Set(questionResponses)];
    const concatenatedResponses = uniqueResponses.join(" ; ");

    lines.push(`• ${question.label}`);
    lines.push(`  - ${concatenatedResponses}`);
    lines.push("");
  }

  if (lines.length === 0) {
    return "Aucune réponse disponible pour cette catégorie.";
  }

  return lines.join("\n").trim();
};

export default function SwotPage() {
  const params = useParams();
  const router = useRouter();
  const [autoStrengths, setAutoStrengths] = useState("");
  const [autoWeaknesses, setAutoWeaknesses] = useState("");
  const [autoOpportunities, setAutoOpportunities] = useState("");
  const [autoThreats, setAutoThreats] = useState("");

  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [threats, setThreats] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charge les questions + réponses du projet puis produit les 4 blocs SWOT.
  // Chaque bloc contient les questions de sa catégorie et les réponses concaténées.
  useEffect(() => {
    const fetchSwotData = async () => {
      try {
        setLoading(true);
        const [questionsResponse, responsesResponse, projectSwotResponse] = await Promise.all([
          api_backend.get(`/question/get/project/${params.projectId}`),
          api_backend.get(`/response/get/project/${params.projectId}`),
          api_backend.get(`/project/${params.projectId}/swot`),
        ]);

        const questions = (questionsResponse.data ?? []) as ProjectQuestion[];
        const responses = (responsesResponse.data ?? []) as ProjectResponse[];
        const projectSwot = projectSwotResponse.data ?? {};

        setAutoStrengths(buildCategoryText(questions, responses, "strength"));
        setAutoWeaknesses(buildCategoryText(questions, responses, "weakness"));
        setAutoOpportunities(buildCategoryText(questions, responses, "opportunity"));
        setAutoThreats(buildCategoryText(questions, responses, "threat"));

        setStrengths(projectSwot.SWOT_strength ?? "");
        setWeaknesses(projectSwot.SWOT_weakness ?? "");
        setOpportunities(projectSwot.SWOT_opportunity ?? "");
        setThreats(projectSwot.SWOT_threat ?? "");
      } catch (error) {
        console.error("Erreur lors du chargement des données SWOT:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.projectId) {
      fetchSwotData();
    }
  }, [params.projectId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api_backend.post(`/project/${params.projectId}/swot`, {
        SWOT_strength: strengths,
        SWOT_weakness: weaknesses,
        SWOT_opportunity: opportunities,
        SWOT_threat: threats,
      });
      alert("Analyse SWOT sauvegardée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'analyse SWOT:", error);
      alert("Erreur lors de la sauvegarde de l'analyse SWOT");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Analyse SWOT"
          description="Forces, Faiblesses, Opportunités et Menaces de votre projet"
        />
        <Button
          size="md"
          onClick={() => router.push(`/${params.clientId}/${params.projectId}/ideation`)}
        >
          Retour à l'idéation
        </Button>
      </div>
      
      <section className="mt-6">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 md:px-6">
            <h2 className="text-base font-semibold text-slate-700">Interne</h2>
            <p className="text-sm text-slate-600 mt-1">Forces et faiblesses internes de la structure.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col">
                <div className="bg-[#5f7a58] text-white p-4 rounded-t-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={Icons.check} className="text-xl" />
                  <h3 className="text-lg font-semibold">Forces</h3>
                </div>
                <textarea
                  value={autoStrengths}
                  readOnly
                  className="w-full h-100 p-4 border-2 border-[#5f7a58] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5f7a58] text-base font-noto"
                />
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Complément utilisateur (forices, nuances, précisions)..."
                  className="w-full h-36 mt-3 p-4 border-2 border-[#5f7a58] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5f7a58] text-base font-noto"
                />
              </div>

              <div className="flex flex-col">
                <div className="bg-[#8c6d62] text-white p-4 rounded-t-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={Icons.check} className="text-xl" />
                  <h3 className="text-lg font-semibold">Faiblesses</h3>
                </div>
                <textarea
                  value={autoWeaknesses}
                  readOnly
                  className="w-full h-100 p-4 border-2 border-[#8c6d62] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8c6d62] text-base font-noto"
                />
                <textarea
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="Complément utilisateur (causes, contraintes, points de vigilance)..."
                  className="w-full h-36 mt-3 p-4 border-2 border-[#8c6d62] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8c6d62] text-base font-noto"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 md:px-6">
            <h2 className="text-base font-semibold text-slate-700">Externe</h2>
            <p className="text-sm text-slate-600 mt-1">Opportunités et menaces liées aux paramêtres extérieurs à la structure.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col">
                <div className="bg-[#7fae7b] text-white p-4 rounded-t-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={Icons.lightbulb} className="text-xl" />
                  <h3 className="text-lg font-semibold">Opportunités</h3>
                </div>
                <textarea
                  value={autoOpportunities}
                  readOnly
                  className="w-full h-100 p-4 border-2 border-[#7fae7b] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7fae7b] text-base font-noto"
                />
                <textarea
                  value={opportunities}
                  onChange={(e) => setOpportunities(e.target.value)}
                  placeholder="Complément utilisateur (axes de développement, partenariats, marchés)..."
                  className="w-full h-36 mt-3 p-4 border-2 border-[#7fae7b] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7fae7b] text-base font-noto"
                />
              </div>

              <div className="flex flex-col">
                <div className="bg-[#b08f83] text-white p-4 rounded-t-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={Icons.check} className="text-xl" />
                  <h3 className="text-lg font-semibold">Menaces</h3>
                </div>
                <textarea
                  value={autoThreats}
                  readOnly
                  className="w-full h-100 p-4 border-2 border-[#b08f83] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#b08f83] text-base font-noto"
                />
                <textarea
                  value={threats}
                  onChange={(e) => setThreats(e.target.value)}
                  placeholder="Complément utilisateur (risques externes, mitigation, scénarios)..."
                  className="w-full h-36 mt-3 p-4 border-2 border-[#b08f83] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#b08f83] text-base font-noto"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} size="md" disabled={saving || loading}>
            <FontAwesomeIcon icon={Icons.check} className={`mr-2 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Enregistrement..." : "Enregistrer les compléments"}
          </Button>
        </div>
      </section>
    </div>
  );
}
