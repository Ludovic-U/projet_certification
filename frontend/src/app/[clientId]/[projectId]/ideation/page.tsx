"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const modalWasOpen = useRef(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [categories, setCategories] = useState<{ questionCategoryId: number; label: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [swotProgress, setSwotProgress] = useState(0);
  const [goDecision, setGoDecision] = useState<"go" | "nogo" | null>(null);
  const [headerFill, setHeaderFill] = useState<
    | {
        color: "go" | "nogo";
        direction: "in" | "out";
        key: number;
      }
    | null
  >(null);

  // Store the response value
  const [responseValue, setResponseValue] = useState<string | string[] | number[]>("");
  // Store keyword for response
  const [responseKeyword, setResponseKeyword] = useState<string>("");
  const [projectResponses, setProjectResponses] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api_backend.get(`/question/categories`);
        const fetchedCategories = res.data || [];
        setCategories(fetchedCategories);
        if (!selectedCategory) {
          const defaultCategory = fetchedCategories.find(
            (category: { label: string }) =>
              category.label?.trim().toLowerCase() === "analyse opportunité"
          );
          if (defaultCategory) {
            setSelectedCategory(defaultCategory.label);
          }
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

  const getQuestionCategoryLabel = (question: Question) => {
    if (typeof question.category === "string") {
      return question.category;
    }
    const anyQuestion = question as any;
    return anyQuestion.questionCategory?.label ?? anyQuestion.category?.label ?? "";
  };

  const handleOpenQuestion = (question: Question) => {
    setSelectedQuestion(question);
    // Initialize response value based on question type
    if (question.hasMultipleOpenResponse) {
      setResponseValue([""]);
    } else if ((question.options?.length ?? 0) > 0) {
      setResponseValue([]);
    } else {
      setResponseValue("");
    }
    modalResponse.openModal();
  };

  // const getResponseForm = (question: Question) => {
  //   if (question.shouldMultiply) return () => <div>Question répétée</div>;
  //   if (question.hasMultipleOpenResponse) return ReponsesPlusieurs;
  //   if ((question.options?.length ?? 0) > 0)
  //     return ReponseSelect;
  //   return ReponseUnique;
  // };

  const filteredQuestions = useMemo(() => {
    return selectedCategory
      ? questions.filter((q) => getQuestionCategoryLabel(q) === selectedCategory)
      : questions;
  }, [questions, selectedCategory]);

  const treeQuestions = useMemo(() => {
    return filteredQuestions.map((q) => ({
      ...q,
      status: q.status ?? "pending",
    }));
  }, [filteredQuestions]);

  const visibleCategories = categories.filter((category) =>
    questions.some((q) => getQuestionCategoryLabel(q) === category.label)
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

  const isOpportunitySelected =
    selectedCategory?.trim().toLowerCase() === "analyse opportunité";

  const goNogoKey = useMemo(() => {
    if (!projectId) return null;
    return `project_${projectId}_goNogo`;
  }, [projectId]);

  useEffect(() => {
    if (!goNogoKey) return;
    const stored = data?.[goNogoKey];
    const normalized = stored === "go" || stored === "nogo" ? stored : null;

    if (normalized === goDecision) return;

    setGoDecision(normalized);
    if (normalized) {
      setHeaderFill({ color: normalized, direction: "in", key: Date.now() });
    } else {
      setHeaderFill(null);
    }
  }, [data, goNogoKey, goDecision]);

  useEffect(() => {
    if (!isOpportunitySelected) {
      setHeaderFill(null);
      return;
    }

    if (goDecision) {
      setHeaderFill({ color: goDecision, direction: "in", key: Date.now() });
    }
  }, [isOpportunitySelected, goDecision]);

  const updateGoNogo = async (value: "go" | "nogo" | null) => {
    try {
      await api_backend.post(`/project/${projectId}/go-nogo`, {
        goNogo: value,
      });
    } catch (error) {
      console.error("Erreur lors de la mise a jour go/nogo:", error);
    }
  };

  if (loading)
    return (
      <div className="flex">
        Chargement des questions...
        <LoadingSpinner />
      </div>
    );

  const handleDecisionClick = (decision: "go" | "nogo") => {
    if (goDecision === decision) {
      setGoDecision(null);
      setHeaderFill({ color: decision, direction: "out", key: Date.now() });
      if (goNogoKey) {
        removeItem(goNogoKey);
      }
      updateGoNogo(null);
      return;
    }

    setGoDecision(decision);
    setHeaderFill({ color: decision, direction: "in", key: Date.now() });
    if (goNogoKey) {
      setItem(goNogoKey, decision);
    }
    updateGoNogo(decision);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative overflow-hidden flex items-center justify-between gap-4 px-4 py-3 rounded-xl mb-6">
        {headerFill && (
          <div
            key={headerFill.key}
            className="absolute inset-0 pointer-events-none"
          >
            <span
              className={`absolute left-1/2 top-1/2 h-16 w-16 rounded-full ${
                headerFill.color === "go" ? "bg-green-200" : "bg-red-200"
              } ${
                headerFill.direction === "in"
                  ? "animate-[circle-fill_700ms_ease-out_forwards]"
                  : "animate-[circle-unfill_700ms_ease-in_forwards]"
              }`}
              onAnimationEnd={() => {
                  if (headerFill.direction === "out") {
                  setHeaderFill(null);
                }
              }}
            />
          </div>
        )}
        <div className="relative z-10 flex-1">
          <PageHeader
            title={"Projet " + (data?.projectName ?? "") + " - IDEATION"}
            description={config?.subtitles.overview}
          />
        </div>
        {isOpportunitySelected && (
          <div className="relative z-10 flex items-center gap-4">
            <Button
              className={`h-14 px-10 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-opacity duration-200 ${
                goDecision === "nogo" ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              onClick={() => handleDecisionClick("go")}
            >
              GO
            </Button>
            <Button
              className={`h-14 px-10 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-opacity duration-200 ${
                goDecision === "go" ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              onClick={() => handleDecisionClick("nogo")}
            >
              NOGO
            </Button>
          </div>
        )}
      </div>
      <section className="flex flex-1 gap-4">
        {/* Colonne de gauche avec les Cards */}
        <div className="flex flex-col gap-4 w-[320px] min-w-[320px]">
          {visibleCategories.map((category, index) => {
            const total = questions.filter(
              (q) => getQuestionCategoryLabel(q) === category.label
            ).length;
            const completed = questions.filter((q) => {
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
            onButtonClick={() => router.push(`/${clientId}/${projectId}/swot`)}
          />
        </div>

        {/* Zone principale avec le TreeView */}
        <div className="flex rounded-xl flex-col bg-light flex-1 items-center justify-center">
          <TreeView questions={treeQuestions} onNodesChange={setNodesState} />
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
            // Test log
            console.log(responseValue);
            modalResponse.closeModal();
          }}
          onSkip={() => modalResponse.closeModal()}
        >
          {selectedQuestion.hasMultipleOpenResponse ? (
            <ReponsesPlusieurs
              value={responseValue as string[]}
              onChange={setResponseValue as (v: string[]) => void}
            />
          ) : (selectedQuestion.options?.length ?? 0) > 0 ? (
            <ReponseSelect
              options={(selectedQuestion.options ?? []).map((opt, idx) => ({ id: idx, label: opt, optionId: idx, questionId: Number(selectedQuestion.questionId) }))}
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
    </div>
  );
}
