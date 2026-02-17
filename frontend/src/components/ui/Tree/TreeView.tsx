"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import ModalQuestion from "../ModalQuestion/ModalQuestion";
import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { useModal } from "@/hooks";
import {
  ReponseUnique,
  ReponsesPlusieurs,
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

type ProjectResponse = {
  responseId?: number;
  questionId: number;
  label: string | null;
  keyword?: string | null;
};

type FlowNodeData = Question & {
  nodeKind?: TreeNodeKind;
  parentNodeId?: string | null;
  themeKey?: string;
  depth?: number;
  isVirtualRoot?: boolean;
  responseId?: number;
  isCollapsed?: boolean;
};

export default function TreeView({
  questions,
  onNodesChange,
  revealByResponses = true,
  onQuestionClick,
  fitViewTrigger,
  onProjectResponsesChange,
}: TreeViewProps) {
  const params = useParams();
  const { projectId } = params;

  const modal = useModal();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingResponse, setEditingResponse] = useState<ProjectResponse | null>(null);

  const [responseValue, setResponseValue] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [multipleResponses, setMultipleResponses] = useState<string[]>([]);
  const [responseKeyword, setResponseKeyword] = useState<string>("");

  const [projectResponses, setProjectResponses] = useState<ProjectResponse[]>([]);
  const [collapsedThemes, setCollapsedThemes] = useState<Set<string>>(new Set());
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const hydrateResponseForm = (question: Question, response?: ProjectResponse | null) => {
    setResponseKeyword(response?.keyword || "");

    if (question.hasMultipleOpenResponse) {
      const values = normalizeCsvValues(response?.label);
      setMultipleResponses(values.length > 0 ? values : [""]);
      setSelectedOptions([]);
      setResponseValue("");
      return;
    }

    if (question.options && question.options.length > 0) {
      const selectedLabels = normalizeCsvValues(response?.label);
      const optionIndexes = (question.options || [])
        .map((option, index) => (selectedLabels.includes(option) ? index : -1))
        .filter((index) => index >= 0);

      setSelectedOptions(optionIndexes);
      setMultipleResponses([""]);
      setResponseValue("");
      return;
    }

    setResponseValue(response?.label || "");
    setSelectedOptions([]);
    setMultipleResponses([""]);
  };

  const openQuestionModal = (question: Question, node: Node, response?: ProjectResponse | null) => {
    setSelectedNode(node);
    setSelectedQuestion(question);
    setEditingResponse(response || null);
    hydrateResponseForm(question, response);
    modal.openModal();
  };

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

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!questions || questions.length === 0) {
      return { nodes: [], edges: [] };
    }

    const root = buildHierarchy(questions);
    const laidOutRoot = computeTreeLayout(root);
    return d3ToReactFlow(laidOutRoot);
  }, [questions]);

  const { nodes, edges } = useMemo(() => {
    const RESPONSE_OFFSET_X = 230;
    const RESPONSE_OFFSET_Y = 30;
    const RESPONSE_VERTICAL_GAP = 70;
    const COLLISION_X_THRESHOLD = 160;
    const COLLISION_Y_THRESHOLD = 55;

    const responseMap = new Map<number, ProjectResponse>();
    projectResponses.forEach((response) => {
      responseMap.set(Number(response.questionId), response);
    });

    const baseNodes = initialNodes.map((node) => ({ ...node, data: { ...(node.data as any) } }));
    const baseEdges = [...initialEdges];

    const visibilityMap = new Map<string, boolean>();
    const nodeKindById = new Map<string, TreeNodeKind>();
    const questionNodesByQuestionId = new Map<number, Node>();

    baseNodes.forEach((node) => {
      const data = node.data as FlowNodeData;
      if (data.nodeKind) {
        nodeKindById.set(node.id, data.nodeKind);
      }
    });

    baseNodes.forEach((node) => {
      const data = node.data as FlowNodeData;

      if (data.isVirtualRoot) {
        node.hidden = false;
        visibilityMap.set(node.id, true);
        return;
      }

      if (data.nodeKind === "theme") {
        const isCollapsed = collapsedThemes.has(node.id);
        node.hidden = false;
        node.data = { ...data, isCollapsed };
        visibilityMap.set(node.id, true);
      }
    });

    const questionNodes = baseNodes
      .filter((node) => {
        const data = node.data as FlowNodeData;
        return data.nodeKind === "question" && !data.isVirtualRoot;
      })
      .sort(
        (a, b) =>
          Number((a.data as FlowNodeData).depth || 0) -
          Number((b.data as FlowNodeData).depth || 0)
      );

    questionNodes.forEach((node) => {
      const data = node.data as FlowNodeData;
      const questionId = Number(data.questionId || data.id);
      const parentNodeId = data.parentNodeId || null;
      const parentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
      const parentIsQuestion =
        parentNodeId ? nodeKindById.get(parentNodeId) === "question" : false;
      const parentQuestionId = parentIsQuestion
        ? Number(parentNodeId?.replace("q-", ""))
        : null;
      const parentHasResponse =
        parentQuestionId !== null ? responseMap.has(parentQuestionId) : true;
      const themeNodeId = data.themeKey ? `theme-${data.themeKey}` : null;
      const themeCollapsed = themeNodeId ? collapsedThemes.has(themeNodeId) : false;

      const isVisible =
        !themeCollapsed &&
        parentVisible &&
        (!revealByResponses || !parentIsQuestion || parentHasResponse);

      const responseData = responseMap.get(questionId);
      const hasResponse = Boolean(responseData);
      const isSkipped = responseData?.label == null;

      node.hidden = !isVisible;
      node.data = {
        ...data,
        status: hasResponse ? (isSkipped ? "skipped" : "answered") : "pending",
        keyword: data.keyword,
      };

      visibilityMap.set(node.id, isVisible);
      questionNodesByQuestionId.set(questionId, node);
    });

    if (revealByResponses) {
      const occupiedPositions: Array<{ x: number; y: number }> = baseNodes
        .filter((node) => !node.hidden)
        .map((node) => ({ x: node.position.x, y: node.position.y }));

      const resolveResponseY = (x: number, preferredY: number) => {
        let nextY = preferredY;

        while (
          occupiedPositions.some(
            (position) =>
              Math.abs(position.x - x) < COLLISION_X_THRESHOLD &&
              Math.abs(position.y - nextY) < COLLISION_Y_THRESHOLD
          )
        ) {
          nextY += RESPONSE_VERTICAL_GAP;
        }

        occupiedPositions.push({ x, y: nextY });
        return nextY;
      };

      projectResponses.forEach((response) => {
        if (response.label == null || String(response.label).trim() === "") {
          return;
        }

        const questionNode = questionNodesByQuestionId.get(Number(response.questionId));
        if (!questionNode) {
          return;
        }

        const responseNodeId = `r-${response.responseId ?? response.questionId}`;
        const responseDirection = questionNode.position.x < 0 ? -1 : 1;
        const responseX =
          questionNode.position.x + RESPONSE_OFFSET_X * responseDirection;
        const preferredY = questionNode.position.y + RESPONSE_OFFSET_Y;
        const responseY = resolveResponseY(responseX, preferredY);

        const responseNode: Node = {
          id: responseNodeId,
          type: "response",
          position: {
            x: responseX,
            y: responseY,
          },
          data: {
            nodeKind: "response",
            label: response.label,
            keyword: response.keyword,
            responseId: response.responseId,
            questionId: response.questionId,
            parentNodeId: questionNode.id,
          },
          hidden: questionNode.hidden,
        };

        baseNodes.push(responseNode);
        baseEdges.push({
          id: `e-${questionNode.id}-${responseNodeId}`,
          source: questionNode.id,
          target: responseNodeId,
        });
      });
    }

    return { nodes: baseNodes, edges: baseEdges };
  }, [
    initialNodes,
    initialEdges,
    projectResponses,
    revealByResponses,
    collapsedThemes,
  ]);

  useEffect(() => {
    onNodesChange?.(nodes);
  }, [nodes, onNodesChange]);

  useEffect(() => {
    onProjectResponsesChange?.(projectResponses);
  }, [projectResponses, onProjectResponsesChange]);

  useEffect(() => {
    if (nodes.length > 0) {
      reactFlowInstance?.fitView({
        padding: 0.2,
        minZoom: 0.8,
      });
    }
  }, [nodes, reactFlowInstance]);

  useEffect(() => {
    if (!reactFlowInstance || nodes.length === 0 || fitViewTrigger === undefined) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      reactFlowInstance.fitView();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fitViewTrigger, reactFlowInstance, nodes.length]);

  const handleNodeClick = async (_: any, node: Node) => {
    const data = node.data as FlowNodeData;

    if (data.isVirtualRoot) {
      return;
    }

    if (data.nodeKind === "theme") {
      const hasQuestionId = data.questionId !== undefined && data.questionId !== null;
      if (hasQuestionId) {
        const question = data as Question;
        if (onQuestionClick) {
          onQuestionClick(question, node);
          return;
        }
      }

      setCollapsedThemes((prev) => {
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

      const questionNode = nodes.find((n) => n.id === data.parentNodeId) || node;
      openQuestionModal(question, questionNode, response);
    }
  };

  const handleValidate = async () => {
    if (!selectedNode || !selectedQuestion) return;

    const question = selectedQuestion;
    const questionId = Number(question.questionId || question.id);

    if (!questionId) {
      return;
    }

    let label = "";

    if (question.hasMultipleOpenResponse) {
      label = multipleResponses.filter((r) => r.trim() !== "").join(", ");
    } else if (question.options && question.options.length > 0) {
      const selectedLabels = selectedOptions
        .map((optionIndex) => question.options?.find((_, idx) => idx === optionIndex))
        .filter(Boolean)
        .join(", ");
      label = selectedLabels;
    } else {
      label = responseValue;
    }

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

  const nodeTypes = useMemo(
    () => ({
      question: QuestionNode,
      theme: ThemeNode,
      response: ResponseNode,
    }),
    []
  );

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
        nodes={nodes}
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
          {selectedQuestion.shouldMultiply ? (
            <div>Question répétée</div>
          ) : selectedQuestion.hasMultipleOpenResponse ? (
            <ReponsesPlusieurs
              value={multipleResponses}
              onChange={setMultipleResponses}
            />
          ) : (selectedQuestion.options?.length ?? 0) > 0 ? (
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
