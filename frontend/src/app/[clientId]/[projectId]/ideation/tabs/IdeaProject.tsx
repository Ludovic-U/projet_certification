"use client";

import StrategicAnalysisTab from "./StrategicAnalysisTab";
import { useLocalStorage } from "@/context/LocalStorageContext";

type Props = {
  clientId: string;
  projectId: string;
  responsesRefreshTrigger?: number;
};

export default function IdeaProject({ clientId, projectId, responsesRefreshTrigger }: Props) {
  const { data } = useLocalStorage();

  return (
    <StrategicAnalysisTab
      clientId={clientId}
      projectId={projectId}
      questionOnglet="ideation_projet"
      showSwotCard={false}
      rootLabel={data?.projectName ?? "Le projet"}
      responsesRefreshTrigger={responsesRefreshTrigger}
    />
  );
}
