"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button, LoadingSpinner } from "@/components/ui";
import api_backend from "@/api/axiosInstance";

// Board types
type BoardType = "faisabilite" | "strategique";

// Decision types for each board
type FaisabiliteType = "budget" | "rh" | "technique" | "logistique" | "calandaire" | "partenariale";
type StrategiqueType = "ancrage_territorial" | "innovation" | "qualite_offre" | "dev_competences" | "dev_commercial" | "attractivite" | "lien_strategie";

interface ProjectDecision {
  decisionId: number;
  projectId: number;
  boardType: BoardType;
  decisionType: string;
  isApproved: boolean | null;
  pourquoi: string | null;
  decisionFinale: string | null;
}

// French labels for faisabilite board
const faisabiliteLabels: Record<FaisabiliteType, string> = {
  budget: "Faisabilité budget",
  rh: "Faisabilité RH",
  technique: "Faisabilité technique",
  logistique: "Faisabilité logistique",
  calandaire: "Faisabilité calandaire",
  partenariale: "Faisabilité partenariale",
};

// French labels for strategique board
const strategiqueLabels: Record<StrategiqueType, string> = {
  ancrage_territorial: "Ancrage territorial",
  innovation: "Innovation",
  qualite_offre: "Qualité de l'offre service",
  dev_competences: "Développement des compétences internes",
  dev_commercial: "Développement commercial",
  attractivite: "Attractivité",
  lien_strategie: "Lien avec la stratégie de l'organisme",
};

const faisabiliteTypes: FaisabiliteType[] = [
  "budget",
  "rh",
  "technique",
  "logistique",
  "calandaire",
  "partenariale",
];

const strategiqueTypes: StrategiqueType[] = [
  "ancrage_territorial",
  "innovation",
  "qualite_offre",
  "dev_competences",
  "dev_commercial",
  "attractivite",
  "lien_strategie",
];

// Decision finale options
type DecisionFinale = "go" | "nogo" | "pending";

const decisionFinaleLabels: Record<DecisionFinale, string> = {
  go: "GO",
  nogo: "NO-GO",
  pending: "En attente",
};

export default function DecisionPanel() {
  const params = useParams();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  const [decisions, setDecisions] = useState<Record<string, ProjectDecision>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Fetch decisions on mount
  useEffect(() => {
    if (!projectId) return;

    const fetchDecisions = async () => {
      try {
        const response = await api_backend.get(`/project/${projectId}/decisions`);
        const decisionData: ProjectDecision[] = response.data;

        const decisionsMap: Record<string, ProjectDecision> = {};
        decisionData.forEach((decision) => {
          const key = `${decision.boardType}_${decision.decisionType}`;
          decisionsMap[key] = decision;
        });

        setDecisions(decisionsMap);
      } catch (error) {
        console.error("Error fetching decisions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, [projectId]);

  // Handle decision update (isApproved)
  const handleDecisionChange = useCallback(
    async (boardType: BoardType, decisionType: string, isApproved: boolean | null) => {
      if (!projectId || saving) return;

      setSaving(true);
      try {
        const key = `${boardType}_${decisionType}`;
        const currentDecision = decisions[key];
        const response = await api_backend.post(`/project/${projectId}/decisions`, {
          boardType,
          decisionType,
          isApproved,
          pourquoi: currentDecision?.pourquoi || null,
        });

        const updatedDecision = response.data;

        setDecisions((prev) => ({
          ...prev,
          [key]: updatedDecision,
        }));
      } catch (error) {
        console.error("Error updating decision:", error);
      } finally {
        setSaving(false);
      }
    },
    [projectId, decisions, saving]
  );

  // Handle pourquoi text change with debounce
  const handlePourquoiChange = useCallback(
    (boardType: BoardType, decisionType: string, pourquoi: string) => {
      const key = `${boardType}_${decisionType}`;
      
      // Update local state immediately for smooth typing
      setDecisions((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          pourquoi,
        },
      }));

      // Clear existing timer for this field
      const existingTimer = debounceTimers.current.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(async () => {
        if (!projectId) return;

        setSaving(true);
        try {
          const currentDecision = decisions[key];
          await api_backend.post(`/project/${projectId}/decisions`, {
            boardType,
            decisionType,
            isApproved: currentDecision?.isApproved ?? null,
            pourquoi: pourquoi || null,
          });
        } catch (error) {
          console.error("Error updating pourquoi:", error);
        } finally {
          setSaving(false);
        }
      }, 1000); // 1 second debounce

      debounceTimers.current.set(key, timer);
    },
    [projectId, decisions]
  );

  // Handle decision finale change (manual selection) - uses faisabilite board by default
  const handleDecisionFinaleChange = useCallback(
    async (decisionFinale: DecisionFinale | null) => {
      if (!projectId || saving) return;

      setSaving(true);
      try {
        // Get any existing decision for faisabilite board to update
        const existingKeys = Object.keys(decisions).filter(k => k.startsWith(`faisabilite_`));
        const firstDecisionKey = existingKeys[0];
        
        if (firstDecisionKey) {
          // Update existing decision with new decision finale
          const currentDecision = decisions[firstDecisionKey];
          const response = await api_backend.post(`/project/${projectId}/decisions`, {
            boardType: "faisabilite",
            decisionType: currentDecision.decisionType,
            isApproved: currentDecision?.isApproved ?? null,
            pourquoi: currentDecision?.pourquoi || null,
            decisionFinale: decisionFinale,
          });

          // Update all decisions for this board with the new decision finale
          setDecisions((prev) => {
            const updated = { ...prev };
            existingKeys.forEach(key => {
              updated[key] = {
                ...updated[key],
                decisionFinale: decisionFinale,
              };
            });
            return updated;
          });
        } else {
          // No existing decisions, create one with just decision finale
          const response = await api_backend.post(`/project/${projectId}/decisions`, {
            boardType: "faisabilite",
            decisionType: "budget",
            isApproved: null,
            pourquoi: null,
            decisionFinale: decisionFinale,
          });

          const newDecision = response.data;
          setDecisions((prev) => ({
            ...prev,
            [`faisabilite_${newDecision.decisionType}`]: newDecision,
          }));
        }
      } catch (error) {
        console.error("Error updating decision finale:", error);
      } finally {
        setSaving(false);
      }
    },
    [projectId, decisions, saving]
  );

  // Get decision finale for the first board only (Faisabilite)
  const getBoardDecisionFinale = (): DecisionFinale | null => {
    const boardKeys = Object.keys(decisions).filter(k => k.startsWith(`faisabilite_`));
    for (const key of boardKeys) {
      if (decisions[key].decisionFinale) {
        return decisions[key].decisionFinale as DecisionFinale;
      }
    }
    return null;
  };

  if (!projectId || !clientId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  // Render a decision card
  const renderDecisionCard = (boardType: BoardType, decisionType: string, label: string) => {
    const key = `${boardType}_${decisionType}`;
    const decision = decisions[key];
    const isApproved = decision?.isApproved ?? null;

    return (
      <div
        key={key}
        className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-4"
      >
        <h4 className="font-semibold text-dark text-center">
          {label}
        </h4>

        {/* Oui/Non Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={isApproved === true ? "primary" : "primaryBorder"}
            className={`flex-1 ${
              isApproved === true
                ? "bg-green-600 hover:bg-green-700 border-green-600"
                : "text-green-600 border-green-600 hover:bg-green-50"
            }`}
            onClick={() => handleDecisionChange(boardType, decisionType, true)}
            disabled={saving}
          >
            Oui
          </Button>
          <Button
            variant={isApproved === false ? "primary" : "primaryBorder"}
            className={`flex-1 ${
              isApproved === false
                ? "bg-red-600 hover:bg-red-700 border-red-600"
                : "text-red-600 border-red-600 hover:bg-red-50"
            }`}
            onClick={() => handleDecisionChange(boardType, decisionType, false)}
            disabled={saving}
          >
            Non
          </Button>
        </div>

        {/* Pourquoi Text Area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-dark/70">
            Pourquoi ?
          </label>
          <textarea
            className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dark/20"
            rows={3}
            placeholder="Expliquez votre choix..."
            value={decision?.pourquoi || ""}
            onChange={(e) => handlePourquoiChange(boardType, decisionType, e.target.value)}
          />
        </div>
      </div>
    );
  };

  // Render decision finale selector (only for faisabilite board)
  const renderDecisionFinaleSelector = () => {
    const currentFinale = getBoardDecisionFinale();

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <h3 className="text-lg font-semibold text-dark">Décision finale</h3>
          
          {/* Decision Finale Selection */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={currentFinale === "go" ? "primary" : "primaryBorder"}
              className={`flex-1 ${
                currentFinale === "go"
                  ? "bg-green-600 hover:bg-green-700 border-green-600"
                  : "text-green-600 border-green-600 hover:bg-green-50"
              }`}
              onClick={() => handleDecisionFinaleChange(currentFinale === "go" ? null : "go")}
              disabled={saving}
            >
              GO ✓
            </Button>
            <Button
              variant={currentFinale === "nogo" ? "primary" : "primaryBorder"}
              className={`flex-1 ${
                currentFinale === "nogo"
                  ? "bg-red-600 hover:bg-red-700 border-red-600"
                  : "text-red-600 border-red-600 hover:bg-red-50"
              }`}
              onClick={() => handleDecisionFinaleChange(currentFinale === "nogo" ? null : "nogo")}
              disabled={saving}
            >
              NO-GO ✗
            </Button>
            <Button
              variant={currentFinale === "pending" ? "primary" : "primaryBorder"}
              className={`flex-1 ${
                currentFinale === "pending"
                  ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500"
                  : "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
              }`}
              onClick={() => handleDecisionFinaleChange(currentFinale === "pending" ? null : "pending")}
              disabled={saving}
            >
              En attente
            </Button>
          </div>

          {currentFinale && (
            <p className="text-sm text-dark/60">
              Décision finale: <strong>{decisionFinaleLabels[currentFinale]}</strong>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-1 min-h-0 overflow-y-auto">
      <div className="flex flex-col w-full gap-8 p-6">
        {/* Board 1: Faisabilité */}
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">Faisabilité</h2>
          {renderDecisionFinaleSelector()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {faisabiliteTypes.map((type) => 
              renderDecisionCard("faisabilite", type, faisabiliteLabels[type])
            )}
          </div>
        </div>

        {/* Board 2: Stratégique */}
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">Analyse Stratégique</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {strategiqueTypes.map((type) => 
              renderDecisionCard("strategique", type, strategiqueLabels[type])
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-dark/5 rounded-xl p-4">
          <p className="text-sm text-dark/70 text-center">
            Répondez à chaque question en sélectionnant "Oui" ou "Non" 
            et en expliquant votre choix. Choisissez ensuite votre décision finale (GO, NO-GO, ou En attente) 
            pour chaque board.
          </p>
        </div>
      </div>
    </section>
  );
}
