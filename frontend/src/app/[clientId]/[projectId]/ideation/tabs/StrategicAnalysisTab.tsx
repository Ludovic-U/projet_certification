"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Node } from "@xyflow/react";
import { Button, Card, LoadingSpinner, Modal } from "@/components/ui";
import TreeView from "@/components/ui/Tree/TreeView";
import { useProjectQuestion } from "@/hooks/useProjectQuestions";
import { useModal } from "@/hooks";
import { Question } from "@/types/question";
import api_backend from "@/api/axiosInstance";
import { useRouter } from "next/navigation";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import {
  ReponseUnique,
  ReponseSelect,
} from "@/components/forms";
import ModalQuestion from "@/components/ui/ModalQuestion/ModalQuestion";

type Props = {
  clientId: string;
  projectId: string;
};

export default function StrategicAnalysisTab({ clientId, projectId }: Props) {
  const router = useRouter();
  const { questions, loading } = useProjectQuestion(Number(projectId));
  const [nodesState, setNodesState] = useState<Node[]>([]);
  const modalQuestions = useModal();
  const modalResponse = useModal();
  const modalWasOpen = useRef(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [categories, setCategories] = useState<
    { questionCategoryId: number; label: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [swotProgress, setSwotProgress] = useState(0);
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [responseValue, setResponseValue] = useState<string | string[] | number[]>("");
  const [projectResponses, setProjectResponses] = useState<any[]>([]);

  const handleProjectResponsesChange = (responses: any[]) => {
    setProjectResponses(responses);
  };

  const getQuestionCategoryLabel = (question: Question) => {
    return typeof question.category === "string" ? question.category : "";
  };

  const isThemeQuestion = (question: Question) => {
    return getQuestionCategoryLabel(question).trim().toLowerCase() === "theme";
  };

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api_backend.get(`/question/categories`);
        const fetchedCategories = res.data || [];
        setCategories(fetchedCategories);
        if (!selectedCategory) {
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des categories:", error);
      }
    };

    fetchCategories();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await api_backend.get(`/response/get/project/${projectId}`);
        setProjectResponses(res.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des reponses:", error);
        setProjectResponses([]);
      }
    };

    if (projectId) {
      fetchResponses();
    }
  }, [projectId]);

  useEffect(() => {
    if (modalWasOpen.current && !modalQuestions.isOpen) {
      setSelectedCategory(null);
    }
    modalWasOpen.current = modalQuestions.isOpen;
  }, [modalQuestions.isOpen]);

  const filteredQuestions = useMemo(() => {
    const analyseExistantQuestions = questions.filter(
      (q) => (typeof q.onglet === "string" ? q.onglet : "analyse_existant") === "analyse_existant"
    );

    return selectedCategory
      ? analyseExistantQuestions.filter((q) => getQuestionCategoryLabel(q) === selectedCategory)
      : analyseExistantQuestions;
  }, [questions, selectedCategory]);

  const treeQuestions = useMemo(() => {
    return filteredQuestions.map((q) => ({
      ...q,
      status: q.status ?? "pending",
    }));
  }, [filteredQuestions]);

  const nonThemeQuestions = useMemo(() => {
    return filteredQuestions.filter((q) => !isThemeQuestion(q));
  }, [filteredQuestions]);

  const visibleCategories = categories.filter((category) =>
    nonThemeQuestions.some((q) => getQuestionCategoryLabel(q) === category.label)
  );

  const completedQuestionIds = useMemo(() => {
    return new Set<number>(
      (projectResponses || [])
        .map((response: any) => Number(response.questionId))
        .filter((questionId: number) => Number.isInteger(questionId))
    );
  }, [projectResponses]);

  const categoryColors = [
    "#96776E",
    "#A3B18A",
    "#D98C6C",
    "#6C8EBF",
    "#B56576",
    "#588157",
  ];

  const handleOpenQuestion = (question: Question) => {
    setSelectedQuestion(question);
    if ((question.options?.length ?? 0) > 0) {
      setResponseValue([]);
    } else {
      setResponseValue("");
    }
    modalResponse.openModal();
  };

  if (loading)
    return (
      <div className="flex">
        Chargement des questions...
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <section className="flex flex-1 gap-4 min-h-0">
        <div className="flex flex-col gap-4 w-[320px] min-w-[320px] min-h-0">
          <div className="flex flex-col gap-4 overflow-y-auto pr-1 pl-2 pt-2 flex-1">
            <Card
              color="#6366F1"
              title="Vue globale"
              max={nonThemeQuestions.length}
              progress={nonThemeQuestions.filter((q) => completedQuestionIds.has(Number(q.questionId))).length}
              buttonLabel="voir toutes les questions"
              size="sm"
              className={
                selectedCategory === null
                  ? "ring-2 ring-dark shadow-700base"
                  : ""
              }
              onButtonClick={() => {
                if (selectedCategory === null) {
                  modalQuestions.openModal();
                  return;
                }
                setSelectedCategory(null);
                setFitViewTrigger((prev) => prev + 1);
              }}
            />

            {visibleCategories.map((category, index) => {
              const total = nonThemeQuestions.filter(
                (q) => getQuestionCategoryLabel(q) === category.label
              ).length;
              const completed = nonThemeQuestions.filter((q) => {
                const nodeCategory = getQuestionCategoryLabel(q);
                return (
                  nodeCategory === category.label &&
                  completedQuestionIds.has(Number(q.questionId))
                );
              }).length;

              return (
                <Card
                  key={category.questionCategoryId}
                  color={categoryColors[index % categoryColors.length]}
                  title={category.label}
                  max={total}
                  progress={completed}
                  buttonLabel="voir les questions"
                  size="sm"
                  className={
                    selectedCategory === category.label
                      ? "ring-2 ring-dark shadow-700base"
                      : ""
                  }
                  onButtonClick={() => {
                    if (selectedCategory === category.label) {
                      modalQuestions.openModal();
                      return;
                    }
                    setSelectedCategory(category.label);
                  }}
                />
              );
            })}
            <Card
              color="#4CAF50"
              title="Analyse SWOT"
              max={4}
              progress={swotProgress}
              buttonLabel="Remplir l'analyse"
              size="sm"
              onButtonClick={() => router.push(`/${clientId}/${projectId}/swot`)}
            />
          </div>
        </div>

        <div className="flex rounded-xl flex-col bg-white border border-dark/10 flex-1 items-center justify-center">
          <TreeView
            questions={treeQuestions}
            onNodesChange={setNodesState}
            fitViewTrigger={fitViewTrigger}
            onProjectResponsesChange={handleProjectResponsesChange}
          />
        </div>
      </section>

      <Modal
        modal={modalQuestions}
        title={selectedCategory ? `Questions - ${selectedCategory}` : "Toutes les questions"}
      >
        <div className="flex flex-col gap-3 p-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.slice(0).map((q: Question) => (
              <div
                key={q.questionId}
                className="p-3 border w-90 rounded-lg flex justify-between"
              >
                <p className="truncate">{q.label}</p>
                <Button size="sm" onClick={() => handleOpenQuestion(q)}>
                  <FontAwesomeIcon icon={Icons.arrowRight} />
                </Button>
              </div>
            ))
          ) : (
            <p>Aucune question pour cette categorie.</p>
          )}
        </div>
      </Modal>
      {selectedQuestion && (
        <ModalQuestion
          modal={modalResponse}
          question={selectedQuestion.label || "Question"}
          questionId={selectedQuestion.id?.toString() || "id"}
          onValidate={() => {
            console.log(responseValue);
            modalResponse.closeModal();
          }}
          onSkip={() => modalResponse.closeModal()}
        >
          {(selectedQuestion.options?.length ?? 0) > 0 ? (
            <ReponseSelect
              options={(selectedQuestion.options ?? []).map((opt, idx) => ({
                id: idx,
                label: opt,
                optionId: idx,
                questionId: Number(selectedQuestion.questionId),
              }))}
              value={responseValue as number[]}
              onChange={setResponseValue as (v: number[]) => void}
            />
          ) : (
            <ReponseUnique
              value={responseValue as string}
              onChange={setResponseValue as (v: string) => void}
            />
          )}
        </ModalQuestion>
      )}
    </>
  );
}
