"use client";

import React, { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PageHeader, Card, Modal, Table, Button } from "@/components/ui";
import { questionsList } from "@/components/ui/Table/table.variants/questions";
import TreeView from "@/components/ui/Tree/TreeView";
import { useProjectQuestion } from "@/hooks/useProjectQuestions";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { LoadingSpinner } from "@/components/ui";
import { useModal } from "@/hooks";
import { Question } from "@/types/question";
import { useParams, useRouter } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";
import { useLocalStorage } from "@/context/LocalStorageContext";
import api_backend from "@/api/axiosInstance";


import {
  ReponseUnique,
  ReponsesPlusieurs,
  ReponseSelect,
} from "@/components/forms";

import ModalQuestion from "@/components/ui/ModalQuestion/ModalQuestion";

export default function IdeationPage() {
  const { data, setItem, removeItem } = useLocalStorage();
  const { config } =  useConfig();
  const params = useParams();
  const router = useRouter();
  // Access dynamic route params
  const { projectId, clientId } = params;
  const { questions, loading } = useProjectQuestion(Number(projectId)); // Appel api
  const [nodesState, setNodesState] = useState<Node[]>([]);
  const modalQuestions = useModal();
  const modalResponse = useModal();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [swotProgress, setSwotProgress] = useState(0);

  // Store the response value
  const [responseValue, setResponseValue] = useState<string>("");
  // Store keyword for response
  const [responseKeyword, setResponseKeyword] = useState<string>("");

  const progress = nodesState.filter(
    (n) => n.data?.status === "answered" || n.data?.status === "skipped"
  ).length;

  // Fetch SWOT progress
  useEffect(() => {
    const fetchSwotProgress = async () => {
      try {
        const response = await api_backend.get(`/project/${projectId}/swot`);
        const project = response.data;
        
        let completed = 0;
        if (project.SWOT_strength?.trim()) completed++;
        if (project.SWOT_weakness?.trim()) completed++;
        if (project.SWOT_opportunity?.trim()) completed++;
        if (project.SWOT_threat?.trim()) completed++;
        
        setSwotProgress(completed);
      } catch (error) {
        console.error("Erreur lors du chargement de la progression SWOT:", error);
      }
    };
    
    if (projectId) {
      fetchSwotProgress();
    }
  }, [projectId]);

  if (loading)
    return (
      <div className="flex">
        Chargement des questions...
        <LoadingSpinner />
      </div>
    );

  const handleOpenQuestion = (question: Question) => {
    setSelectedQuestion(question);
    modalResponse.openModal();
  };

  const getResponseForm = (question: Question) => {
    if (question.shouldMultiply) return () => <div>Question répétée</div>;
    if (question.hasMultipleOpenResponse) return ReponsesPlusieurs;
    if ((question.options?.length ?? 0) > 0)
      return (props: any) => (
        <ReponseSelect
          options={(question.options ?? []).map((o) => ({ label: o, value: o }))}
          {...props}
        />
      );
    return ReponseUnique;
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title={"Projet " + (data?.projectName ?? "") + " - IDEATION"} description={config?.subtitles.overview}/>
      <section className="flex flex-1 gap-4">
        {/* Colonne de gauche avec les Cards */}
        <div className="flex flex-col gap-4 w-[320px] min-w-[320px]">
          <Card
            color="#96776E"
            title="Synthèse des projets"
            max={questions.length}
            progress={progress}
            buttonLabel="voir toutes les questions"
            onButtonClick={modalQuestions.openModal}
          />
          <Card
            color="#4CAF50"
            title="Analyse SWOT"
            max={4}
            progress={swotProgress}
            buttonLabel="Remplir l'analyse"
            onButtonClick={() => router.push(`/${clientId}/${projectId}/swot`)}
          />
        </div>

        {/* Zone principale avec le TreeView */}
        <div className="flex rounded-xl flex-col bg-light flex-1 items-center justify-center">
          <TreeView questions={questions} onNodesChange={setNodesState} />
        </div>
      </section>

      <Modal modal={modalQuestions} title="Toutes les questions">
        <div className="flex flex-col gap-3 p-4">
          {questions.length > 0 ? (
            questions.slice(0).map((q: Question) => (
              <div
                key={q.questionId}
                className="p-3 border w-[360px] rounded-lg flex justify-between"
              >
                <p className="truncate">{q.label}</p>
                <Button size="sm" onClick={() => handleOpenQuestion(q)}>
                  <FontAwesomeIcon icon={Icons.arrowRight} />
                </Button>
              </div>
            ))
          ) : (
            <p>Aucune question pour ce projet.</p>
          )}
        </div>
      </Modal>
      {selectedQuestion && (
        <ModalQuestion
          modal={modalResponse}
          question={selectedQuestion.label || "Question"}
          questionId={selectedQuestion.id?.toString() || "id"}
          onValidate={() => {
            // Test log
            console.log(responseValue);
            modalResponse.closeModal();
          }}
          onSkip={() => modalResponse.closeModal()}
        >
          {React.createElement(getResponseForm(selectedQuestion), {
            value: responseValue,
            onChange: setResponseValue,
          })}
        </ModalQuestion>
      )}
    </div>
  );
}
