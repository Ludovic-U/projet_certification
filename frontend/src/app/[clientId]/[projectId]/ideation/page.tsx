"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui";
import { useParams } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";
import { useLocalStorage } from "@/context/LocalStorageContext";
import StrategicAnalysisTab from "./tabs/StrategicAnalysisTab";
import PreProjectPanel from "./tabs/PreProjectPanel";
import DecisionPanel from "./tabs/DecisionPanel";
import IdeaProject from "./tabs/IdeaProject";

type TabKey = "analyse" | "idée projet" | "preprojet" | "decision";

export default function IdeationPage() {
  const { data } = useLocalStorage();
  const { config } =  useConfig();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("analyse");
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  if (!projectId || !clientId) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="relative overflow-hidden flex items-center justify-between gap-4 rounded-xl mb-6">
        <div className="relative z-10 flex-1">
          <PageHeader
            title={"Projet " + (data?.projectName ?? "") + " - IDEATION"}
            description={config?.subtitles.overview}
          />
        </div>
      </div>
      <section className="w-full mb-6">
        <div className="grid w-full grid-cols-4 overflow-hidden rounded-xl border border-dark/10 bg-white">
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "analyse"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab("analyse")}
          >
            Analyse strategique
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "idée projet"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab("idée projet")}
          >
            Idée Projet
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "preprojet"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab("preprojet")}
          >
            Pre-projet
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide ${
              activeTab === "decision"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab("decision")}
          >
            Decision
          </button>
        </div>
      </section>
      {activeTab === "analyse" && (
        <StrategicAnalysisTab clientId={clientId} projectId={projectId} />
      )}
      {activeTab === "idée projet" && (
        <IdeaProject />
      )}
      {activeTab === "preprojet" && <PreProjectPanel />}
      {activeTab === "decision" && <DecisionPanel />}
    </div>
  );
}
