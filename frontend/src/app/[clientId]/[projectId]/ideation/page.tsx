"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";
import { useLocalStorage } from "@/context/LocalStorageContext";
import StrategicAnalysisTab from "./tabs/StrategicAnalysisTab";
import IdeaProject from "./tabs/IdeaProject";

type TabKey = "analyse" | "idee-projet";

const getTabFromSearchParam = (tabParam: string | null): TabKey => {
  return tabParam === "idee-projet" ? "idee-projet" : "analyse";
};

export default function IdeationPage() {
  const { data } = useLocalStorage();
  const { config } =  useConfig();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromSearchParam(searchParams.get("tab")));
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  React.useEffect(() => {
    setActiveTab(getTabFromSearchParam(searchParams.get("tab")));
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams.toString());

    if (tab === "analyse") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }

    const query = nextParams.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

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
        <div className="grid w-full grid-cols-2 overflow-hidden rounded-xl border border-dark/10 bg-white">
          <button
            type="button"
            className={`px-6 py-2 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "analyse"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => handleTabChange("analyse")}
          >
            Analyse strategique
          </button>
          <button
            type="button"
            className={`px-6 py-2 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "idee-projet"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => handleTabChange("idee-projet")}
          >
            Idée Projet
          </button>
          
        </div>
      </section>
      {activeTab === "analyse" && (
        <StrategicAnalysisTab clientId={clientId} projectId={projectId} />
      )}
      {activeTab === "idee-projet" && (
        <IdeaProject />
      )}
    </div>
  );
}
