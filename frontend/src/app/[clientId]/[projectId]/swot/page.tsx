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

  // Charger les données SWOT au montage du composant
  useEffect(() => {
    const fetchSwotData = async () => {
      try {
        setLoading(true);
        const response = await api_backend.get(`/project/${params.projectId}/swot`);
        const data = response.data;
        
        setStrengths(data.SWOT_strength || "");
        setWeaknesses(data.SWOT_weakness || "");
        setOpportunities(data.SWOT_opportunity || "");
        setThreats(data.SWOT_threat || "");
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
        SWOT_threat: threats
      });
      alert("Analyse SWOT sauvegardée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
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
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Entrez les forces de votre entreprise...&#10;&#10;• Expertise reconnue&#10;• Équipe qualifiée&#10;• Innovation continue"
                  className="w-full h-100 p-4 border-2 border-[#5f7a58] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5f7a58] text-base font-noto"
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
                  placeholder="Entrez les faiblesses de votre entreprise...&#10;&#10;• Ressources limitées&#10;• Manque de visibilité&#10;• Processus à optimiser"
                  className="w-full h-100 p-4 border-2 border-[#8c6d62] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8c6d62] text-base font-noto"
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
                  placeholder="Entrez les opportunités pour votre entreprise...&#10;&#10;• Nouveaux marchés&#10;• Partenariats stratégiques&#10;• Évolution technologique"
                  className="w-full h-100 p-4 border-2 border-[#7fae7b] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7fae7b] text-base font-noto"
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
                  placeholder="Entrez les menaces pour votre entreprise...&#10;&#10;• Concurrence accrue&#10;• Évolution réglementaire&#10;• Crise économique"
                  className="w-full h-100 p-4 border-2 border-[#b08f83] rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#b08f83] text-base font-noto"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} size="md" disabled={saving || loading}>
            <FontAwesomeIcon icon={saving ? Icons.check : Icons.check} className={`mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? "Enregistrement..." : "Enregistrer l'analyse SWOT"}
          </Button>
        </div>
      </section>
    </div>
  );
}
