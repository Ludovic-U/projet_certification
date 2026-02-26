"use client";

import StrategicAnalysisTab from "./StrategicAnalysisTab";

type Props = {
  clientId: string;
  projectId: string;
};

export default function IdeaProject({ clientId, projectId }: Props) {
  return (
    <StrategicAnalysisTab
      clientId={clientId}
      projectId={projectId}
      questionOnglet="ideation_projet"
      showSwotCard={false}
    />
  );
}
