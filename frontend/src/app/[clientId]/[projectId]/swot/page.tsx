"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import api_backend from "@/api/axiosInstance";

export default function SwotPage() {
  const params = useParams();
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
      <PageHeader
        title="Analyse SWOT"
        description="Forces, Faiblesses, Opportunités et Menaces de votre projet"
      />
      
      <section className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Forces */}
          <div className="flex flex-col">
            <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center gap-3">
              <FontAwesomeIcon icon={Icons.check} className="text-xl" />
              <h2 className="text-lg font-semibold">Forces</h2>
            </div>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Entrez les forces de votre entreprise...&#10;&#10;• Expertise reconnue&#10;• Équipe qualifiée&#10;• Innovation continue"
              className="w-full h-100 p-4 border-2 border-green-600 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-base font-noto"
            />
          </div>

          {/* Faiblesses */}
          <div className="flex flex-col">
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center gap-3">
              <FontAwesomeIcon icon={Icons.check} className="text-xl" />
              <h2 className="text-lg font-semibold">Faiblesses</h2>
            </div>
            <textarea
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="Entrez les faiblesses de votre entreprise...&#10;&#10;• Ressources limitées&#10;• Manque de visibilité&#10;• Processus à optimiser"
              className="w-full h-100 p-4 border-2 border-red-600 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-base font-noto"
            />
          </div>

          {/* Opportunités */}
          <div className="flex flex-col">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center gap-3">
              <FontAwesomeIcon icon={Icons.lightbulb} className="text-xl" />
              <h2 className="text-lg font-semibold">Opportunités</h2>
            </div>
            <textarea
              value={opportunities}
              onChange={(e) => setOpportunities(e.target.value)}
              placeholder="Entrez les opportunités pour votre entreprise...&#10;&#10;• Nouveaux marchés&#10;• Partenariats stratégiques&#10;• Évolution technologique"
              className="w-full h-100 p-4 border-2 border-blue-600 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-noto"
            />
          </div>

          {/* Menaces */}
          <div className="flex flex-col">
            <div className="bg-orange-600 text-white p-4 rounded-t-lg flex items-center gap-3">
              <FontAwesomeIcon icon={Icons.check} className="text-xl" />
              <h2 className="text-lg font-semibold">Menaces</h2>
            </div>
            <textarea
              value={threats}
              onChange={(e) => setThreats(e.target.value)}
              placeholder="Entrez les menaces pour votre entreprise...&#10;&#10;• Concurrence accrue&#10;• Évolution réglementaire&#10;• Crise économique"
              className="w-full h-100 p-4 border-2 border-orange-600 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-base font-noto"
            />
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
