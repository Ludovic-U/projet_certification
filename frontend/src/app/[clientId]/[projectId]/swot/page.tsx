"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import api_backend from "@/api/axiosInstance";


export default function SwotPage() {
  const params = useParams();
  const router = useRouter();
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [threats, setThreats] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSwotData = async () => {
      try {
        setLoading(true);
        const projectSwotResponse = await api_backend.get(`/project/${params.projectId}/swot`);
        const projectSwot = projectSwotResponse.data ?? {};

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

  const handleGenerateSwot = async () => {
    try {
      setSaving(true);
      const response = await api_backend.post(`/project/${params.projectId}/swot/generate`);
      const generatedSwot = response.data;
      setStrengths(generatedSwot.SWOT_strength || "");
      setWeaknesses(generatedSwot.SWOT_weakness || "");
      setOpportunities(generatedSwot.SWOT_opportunity || "");
      setThreats(generatedSwot.SWOT_threat || "");
      alert("Analyse SWOT générée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération de l'analyse SWOT:", error);
      alert("Erreur lors de la génération de l'analyse SWOT");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const swotData = {
        SWOT_strength: strengths,
        SWOT_weakness: weaknesses,
        SWOT_opportunity: opportunities,
        SWOT_threat: threats,
      };
      await api_backend.post(`/project/${params.projectId}/swot`, swotData);
      alert("Compléments SWOT enregistrés avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des compléments SWOT:", error);
      alert("Erreur lors de l'enregistrement des compléments SWOT");
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
        <div className="flex gap-2">
          <Button
            size="md"
            onClick={handleGenerateSwot}
            disabled={saving || loading}
          >
            <FontAwesomeIcon icon={Icons.lightbulb} className="mr-2" />
            Générer avec IA
          </Button>
          <Button
            size="md"
            onClick={() => router.push(`/${params.clientId}/${params.projectId}/ideation`)}
          >
            Retour à l'idéation
          </Button>
        </div>
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
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Forces (complément utilisateur, nuances, précisions)..."
                  className="w-full h-36 p-4 border-2 border-[#5f7a58] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5f7a58] text-base font-noto"
                />
              </div>

              <div className="flex flex-col">
                <div className="bg-[#8c6d62] text-white p-4 rounded-t-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={Icons.check} className="text-xl" />
                  <h3 className="text-lg font-semibold">Faiblesses</h3>
                </div>
                <textarea
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="Faiblesses (causes, contraintes, points de vigilance)..."
                  className="w-full h-36 p-4 border-2 border-[#8c6d62] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8c6d62] text-base font-noto"
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
                  value={opportunities}
                  onChange={(e) => setOpportunities(e.target.value)}
                  placeholder="Opportunités (axes de développement, partenariats, marchés)..."
                  className="w-full h-36 p-4 border-2 border-[#7fae7b] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7fae7b] text-base font-noto"
                />
              </div>

              <div className="flex flex-col">
                <div className="bg-[#b08f83] text-white p-4 rounded-t-lg flex items-center gap-3">
                  <FontAwesomeIcon icon={Icons.check} className="text-xl" />
                  <h3 className="text-lg font-semibold">Menaces</h3>
                </div>
                <textarea
                  value={threats}
                  onChange={(e) => setThreats(e.target.value)}
                  placeholder="Menaces (risques externes, mitigation, scénarios)..."
                  className="w-full h-36 p-4 border-2 border-[#b08f83] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#b08f83] text-base font-noto"
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
