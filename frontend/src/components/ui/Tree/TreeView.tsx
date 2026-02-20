"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Question } from "@/types/question";
import { QuestionNode } from "../Nodes/Question";
import { ThemeNode } from "../Nodes/Theme";
import { ResponseNode } from "../Nodes/Response";
import { buildHierarchy, computeTreeLayout, d3ToReactFlow } from "@/lib/treeUtils";
import { buildTreeSpatialLayout } from "@/lib/treeSpatialLayout";
import ModalQuestion from "../ModalQuestion/ModalQuestion";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";
import {
  ReponseUnique,
  ReponseSelect,
} from "@/components/forms";
import api_backend from "@/api/axiosInstance";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui";

interface TreeViewProps {
  questions: Question[];
  onNodesChange?: (nodes: Node[]) => void;
  revealByResponses?: boolean;
  onQuestionClick?: (question: Question, node: Node) => void;
  fitViewTrigger?: number;
  onProjectResponsesChange?: (responses: any[]) => void;
}

type TreeNodeKind = "theme" | "question" | "response";

// Représente une réponse liée à une question dans le contexte du projet courant.
type ProjectResponse = {
  responseId?: number;
  questionId: number;
  label: string | null;
  keyword?: string | null;
};

// Données enrichies injectées dans les nodes ReactFlow.
// On conserve les champs de Question et on ajoute les métadonnées UI/graph.
type FlowNodeData = Question & {
  nodeKind?: TreeNodeKind;
  parentNodeId?: string | null;
  themeKey?: string;
  depth?: number;
  isVirtualRoot?: boolean;
  responseId?: number;
  isCollapsed?: boolean;
  isCollapsible?: boolean;
  nodeId?: string;
  onToggleCollapse?: (nodeId: string) => void;
};

export default function TreeView({
  questions,
  onNodesChange,
  revealByResponses = true,
  onQuestionClick,
  fitViewTrigger,
  onProjectResponsesChange,
}: TreeViewProps) {
  // Identifiant du projet récupéré depuis la route Next.js.
  const params = useParams();
  const { projectId } = params;

  // Gestion du modal de saisie/édition de réponse.
  const modal = useModal();

  // Sélection courante dans l'UI.
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingResponse, setEditingResponse] = useState<ProjectResponse | null>(null);

  // États du formulaire de réponse (selon le type de question).
  const [responseValue, setResponseValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [responseKeyword, setResponseKeyword] = useState<string>("");

  // Données métier + état d'affichage du graphe.
  const [projectResponses, setProjectResponses] = useState<ProjectResponse[]>([]);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const normalizeCsvValues = (value: string | null | undefined) => {
    if (!value) return [] as string[];
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  };

  // Pré-remplit le formulaire modal à partir d'une réponse existante (édition)
  // ou initialise des valeurs vides (création).
  const hydrateResponseForm = (question: Question, response?: ProjectResponse | null) => {
    setResponseKeyword(response?.keyword || "");

    if (question.options && question.options.length > 0) {
      const selectedLabels = normalizeCsvValues(response?.label);
      const optionIndexes = (question.options || [])
        .map((option, index) => (selectedLabels.includes(option) ? index : -1))
        .filter((index) => index >= 0);

      setSelectedOptions(optionIndexes);
      setResponseValue("");
      return;
    }

    setResponseValue(response?.label || "");
    setSelectedOptions([]);
  };

  // Ouvre le modal et synchronise les états de sélection/édition.
  const openQuestionModal = (question: Question, node: Node, response?: ProjectResponse | null) => {
    setSelectedNode(node);
    setSelectedQuestion(question);
    setEditingResponse(response || null);
    hydrateResponseForm(question, response);
    modal.openModal();
  };

  // En plein écran, on bloque le scroll global pour éviter les interactions parasites.
  useEffect(() => {
    if (!isFullscreen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Recale la vue ReactFlow lors du basculement plein écran.
  useEffect(() => {
    if (!reactFlowInstance) return;
    const frame = window.requestAnimationFrame(() => {
      reactFlowInstance.fitView({
        padding: 0.2,
        minZoom: 0.8,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isFullscreen, reactFlowInstance]);

  // Charge les réponses du projet quand l'affichage est conditionné par les réponses.
  useEffect(() => {
    async function fetchResponses() {
      try {
        const res = await api_backend.get(`/response/get/project/${projectId}`);
        setProjectResponses(res.data || []);
      } catch {
        setProjectResponses([]);
      }
    }

    if (revealByResponses && projectId) {
      fetchResponses();
    }

    if (!revealByResponses) {
      setProjectResponses([]);
    }
  }, [projectId, revealByResponses]);

  // Construit le graphe brut (arbre hiérarchique + layout) depuis les questions.
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!questions || questions.length === 0) {
      return { nodes: [], edges: [] };
    }

    const root = buildHierarchy(questions);
    const laidOutRoot = computeTreeLayout(root);
    return d3ToReactFlow(laidOutRoot);
  }, [questions]);

  // Applique la logique d'affichage:
  // - visibilité des questions selon parent/thème/réponse
  // - statut answered/skipped/pending
  // - ajout dynamique des nodes de réponse
  const { nodes, edges } = useMemo(() => {
    return buildTreeSpatialLayout({
      initialNodes,
      initialEdges,
      projectResponses,
      revealByResponses,
      collapsedNodeIds,
    });
  }, [
    initialNodes,
    initialEdges,
    projectResponses,
    revealByResponses,
    collapsedNodeIds,
  ]);

  const renderedNodes = useMemo(() => {
    return nodes.map((node) => {
      const data = node.data as FlowNodeData;
      if (data.nodeKind !== "question") {
        return node;
      }

      return {
        ...node,
        data: {
          ...data,
          isCollapsible: true,
          isCollapsed: collapsedNodeIds.has(node.id),
          nodeId: node.id,
          onToggleCollapse: toggleNodeCollapse,
        },
      };
    });
  }, [nodes, collapsedNodeIds, toggleNodeCollapse]);

  // Expose les nodes calculés au parent si nécessaire.
  useEffect(() => {
    onNodesChange?.(renderedNodes);
  }, [renderedNodes, onNodesChange]);

  // Expose la liste des réponses projet au parent si nécessaire.
  useEffect(() => {
    onProjectResponsesChange?.(projectResponses);
  }, [projectResponses, onProjectResponsesChange]);

  // Fit déclenché explicitement depuis l'extérieur (prop fitViewTrigger).
  useEffect(() => {
    if (!reactFlowInstance || renderedNodes.length === 0 || fitViewTrigger === undefined) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      reactFlowInstance.fitView();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fitViewTrigger, reactFlowInstance, renderedNodes.length]);

  // Gestion centrale des clics sur nodes (thème / question / réponse).
  const handleNodeClick = async (_: any, node: Node) => {
    const data = node.data as FlowNodeData;

    if (data.isVirtualRoot) {
      return;
    }

    if (data.nodeKind === "theme") {
      // Certains thèmes sont cliquables comme une question (compat héritage données).
      const hasQuestionId = data.questionId !== undefined && data.questionId !== null;
      if (hasQuestionId) {
        const question = data as Question;
        if (onQuestionClick) {
          onQuestionClick(question, node);
          return;
        }
      }

      // Sinon, clic thème = collapse/expand du sous-arbre.
      setCollapsedNodeIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
      return;
    }

    if (data.nodeKind === "question") {
      const question = data as Question;
      if (onQuestionClick) {
        onQuestionClick(question, node);
        return;
      }

      openQuestionModal(question, node, null);
      return;
    }

    if (data.nodeKind === "response") {
      // Clic sur réponse => on rouvre le modal sur la question parente en mode édition.
      const questionId = Number(data.questionId);
      const question = questions.find(
        (q) => Number(q.questionId || q.id) === questionId
      );

      if (!question) {
        return;
      }

      const response = data.responseId
        ? projectResponses.find((r) => r.responseId === data.responseId)
        : projectResponses.find((r) => Number(r.questionId) === questionId);

      if (!response) {
        return;
      }

      const questionNode = renderedNodes.find((n) => n.id === data.parentNodeId) || node;
      openQuestionModal(question, questionNode, response);
    }
  };

  // Crée ou met à jour la réponse courante selon l'état du formulaire et le type de question.
  const handleValidate = async () => {
    if (!selectedNode || !selectedQuestion) return;

    const question = selectedQuestion;
    const questionId = Number(question.questionId || question.id);

    if (!questionId) {
      return;
    }

    let label = "";

    if (question.options && question.options.length > 0) {
      const selectedLabels = selectedOptions
        .map((optionIndex) => question.options?.find((_, idx) => idx === optionIndex))
        .filter(Boolean)
        .join(", ");
      label = selectedLabels;
    } else {
      label = responseValue;
    }

    // On refuse l'envoi d'une réponse vide.
    if (!label || label.trim() === "") {
      return;
    }

    const existingResponse = editingResponse;

    try {
      if (existingResponse?.responseId) {
        const response = await api_backend.patch(
          `/response/update/${existingResponse.responseId}`,
          {
            label,
            keyword: responseKeyword || null,
          }
        );

        setProjectResponses((prev) =>
          prev.map((item) =>
            item.responseId === existingResponse.responseId
              ? { ...item, label: response.data.label, keyword: response.data.keyword }
              : item
          )
        );
      } else {
        const response = await api_backend.post(`/response/create`, {
          label,
          keyword: responseKeyword || null,
          projectId: Number(projectId),
          questionId,
        });

        setProjectResponses((prev) => [...prev, response.data]);
      }

      modal.closeModal();
    } catch (error: any) {
      console.error("Erreur lors de la création/mise à jour de la réponse:", error);
    }
  };

  // Marque une question comme "passée" (label null), en création ou en édition.
  const handleSkip = async () => {
    if (!selectedQuestion) return;

    const questionId = Number(selectedQuestion.questionId || selectedQuestion.id);
    if (!questionId) return;

    const existingResponse = editingResponse;

    try {
      if (existingResponse?.responseId) {
        const response = await api_backend.patch(
          `/response/update/${existingResponse.responseId}`,
          {
            label: null,
            keyword: null,
          }
        );

        setProjectResponses((prev) =>
          prev.map((item) =>
            item.responseId === existingResponse.responseId
              ? { ...item, label: response.data.label, keyword: response.data.keyword }
              : item
          )
        );
      } else {
        const response = await api_backend.post(`/response/create`, {
          label: null,
          keyword: null,
          projectId: Number(projectId),
          questionId,
        });

        setProjectResponses((prev) => [...prev, response.data]);
      }

      modal.closeModal();
    } catch (error: any) {
      console.error("Erreur lors du skip de la réponse:", error);
    }
  };

  // Mapping des types de nodes ReactFlow vers leurs composants UI.
  const nodeTypes = useMemo(
    () => ({
      question: QuestionNode,
      theme: ThemeNode,
      response: ResponseNode,
    }),
    []
  );

  // Indique si la question sélectionnée possède déjà une réponse enregistrée.
  const selectedQuestionHasResponses = selectedQuestion
    ? projectResponses.some(
        (response) => Number(response.questionId) === Number(selectedQuestion.questionId || selectedQuestion.id)
      )
    : false;

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-40 h-screen w-screen bg-white"
          : "h-full w-full bg-white relative"
      }
    >
      <Button
        onClick={toggleFullscreen}
        size="iconS"
        variant="secondary"
        className="absolute top-3 right-3 z-70"
        title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
      >
        <FontAwesomeIcon icon={isFullscreen ? Icons.compress : Icons.expand} />
      </Button>

      <ReactFlow
        nodes={renderedNodes}
        edges={edges}
        defaultEdgeOptions={{ type: "simplebezier", style: { stroke: "#272727" } }}
        connectionLineType={ConnectionLineType.SimpleBezier}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.8,
        }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>

      {selectedQuestion && (
        <ModalQuestion
          modal={modal}
          question={selectedQuestion.label || "Question"}
          questionId={selectedQuestion.id?.toString() || "id"}
          keyword={responseKeyword}
          onValidate={handleValidate}
          onSkip={handleSkip}
          skipLabel={editingResponse ? "supprimer la réponse" : "passer la question"}
          showSkipButton={editingResponse ? true : !selectedQuestionHasResponses}
          onKeywordChange={setResponseKeyword}
        >
          {/* Le composant de saisie est choisi dynamiquement selon la configuration question. */}
          {(selectedQuestion.options?.length ?? 0) > 0 ? (
            <ReponseSelect
              options={(selectedQuestion.options || []).map((opt, index) => ({
                label: opt,
                value: opt,
                optionId: index,
                questionId: Number(selectedQuestion.questionId || selectedQuestion.id || 0),
              }))}
              value={selectedOptions}
              onChange={setSelectedOptions}
            />
          ) : (
            <ReponseUnique
              value={responseValue}
              onChange={setResponseValue}
            />
          )}
        </ModalQuestion>
      )}
    </div>
  );
}
