"use client";

import React, { useState } from "react";
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
import { useParams } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";

import {
  ReponseUnique,
  ReponsesPlusieurs,
  ReponseSelect,
} from "@/components/forms";

import ModalQuestion from "@/components/ui/ModalQuestion/ModalQuestion";

export default function IdeationPage() {
  const { config } =  useConfig();
  const params = useParams();
  // Access dynamic route params
  const { projectId } = params;
  const { questions, loading } = useProjectQuestion(Number(projectId)); // Appel api
  const [nodesState, setNodesState] = useState<Node[]>([]);
  const modalQuestions = useModal();
  const modalResponse = useModal();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  // Store the response value
  const [responseValue, setResponseValue] = useState<string>("");
  // Store keyword for response
  const [responseKeyword, setResponseKeyword] = useState<string>("");

  const progress = nodesState.filter(
    (n) => n.data?.status === "answered" || n.data?.status === "skipped"
  ).length;

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
      <PageHeader
        title="Projet Lambda - IDEATION"
        description={config?.subtitles.ideation}
      />
      <section className="flex flex-1 flex-col items-center">
        <div className="h-fit z-10">
          <Card
            color="#96776E"
            title="Synthèse des projets"
            max={questions.length}
            progress={progress}
            buttonLabel="voir toutes les questions"
            onButtonClick={modalQuestions.openModal}
          />
        </div>

        <div className="flex rounded-xl flex-col m-5 mt-0 bg-light flex-1 w-[80%] items-center justify-center">
          <TreeView questions={questions} onNodesChange={setNodesState} />
        </div>

        <div className="flex gap-8 h-fit">
          <Card
            color="#D4B2A7"
            title="Proposition des valeurs"
            buttonLabel="Voir"
          />
          <Card
            color="#B49186"
            title="Analyse de l'existant"
            buttonLabel="Voir"
          />
          <Card
            color="#715E53"
            title="Auto-positionnement"
            buttonLabel="Voir"
          />
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
