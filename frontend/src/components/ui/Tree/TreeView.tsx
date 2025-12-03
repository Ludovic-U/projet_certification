"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ReactFlow, Node, Edge, Controls, ControlButton } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Question } from "@/types/question";
import { QuestionNode } from "../Nodes/Question";
import {
  buildHierarchy,
  computeTreeLayout,
  d3ToReactFlow,
  generateNodesWithMultiply,
} from "@/lib/treeUtils";
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

interface TreeViewProps {
  questions: Question[];
  onNodesChange?: (nodes: Node[]) => void;
}

export default function TreeView({ questions, onNodesChange }: TreeViewProps) {
  const params = useParams();
  // Access dynamic route params
  const { projectId } = params;
  
  // Etats ReactFlow et Modal
  const modal = useModal();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  // Store the response value
  const [responseValue, setResponseValue] = useState<string>("");
  // Store selected options for ReponseSelect
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  // Store multiple responses for ReponsesPlusieurs
  const [multipleResponses, setMultipleResponses] = useState<string[]>([]);
  // Store keyword for response
  const [responseKeyword, setResponseKeyword] = useState<string>("");
  // Store responses from DB
  const [projectResponses, setProjectResponses] = useState<any[]>([]);
  
  // Fetch all responses for this project
  useEffect(() => {
    async function fetchResponses() {
      try {
        const res = await api_backend.get(`/response/get/project/${projectId}`);
        console.log("Réponses du projet:", res.data);
        setProjectResponses(res.data || []);
      } catch (error) {
        console.log("Aucune réponse trouvée pour ce projet");
        setProjectResponses([]);
      }
    }
    if (projectId) {
      fetchResponses();
    }
  }, [projectId]);
  
  // Génération automatique du layout avec D3
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!questions || questions.length === 0) {
      console.warn("Aucune question à afficher - arbre vide");
      return { nodes: [], edges: [] };
    }

    const root = buildHierarchy(questions);
    const laidOutRoot = computeTreeLayout(root);
    const { nodes, edges } = d3ToReactFlow(laidOutRoot);

    nodes.forEach((n) => {
      console.log(`node ${n.id} options:`, n.data.options);
    });

    return { nodes, edges };
  }, [questions]);
  
  // Update nodes with response status and visibility
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  
  useEffect(() => {
    if (initialNodes.length === 0 || projectResponses.length === 0) {
      setNodes(initialNodes);
      return;
    }
    
    // Create a map of questionId -> response exists
    const responseMap = new Map<number, boolean>();
    projectResponses.forEach((response: any) => {
      responseMap.set(response.questionId, true);
    });
    
    // Update nodes with status and visibility
    const updatedNodes = initialNodes.map((node) => {
      const questionId = node.data.questionId || node.data.id;
      const hasResponse = responseMap.has(Number(questionId));
      const parentId = node.data.parentId;
      
      // Check if parent has a response (if this is not root)
      const parentHasResponse = parentId ? responseMap.has(Number(parentId)) : true;
      
      return {
        ...node,
        data: {
          ...node.data,
          status: hasResponse ? "answered" : "pending",
        },
        // Show node if: it's root OR parent has response
        hidden: parentId !== null && !parentHasResponse,
      };
    });
    
    console.log("Nodes mis à jour avec réponses:", updatedNodes);
    setNodes(updatedNodes);
  }, [initialNodes, projectResponses]);

  // Notifier le parent quand les nodes changent
  useEffect(() => {
    onNodesChange?.(nodes);
  }, [nodes, onNodesChange]);

  const handleNodeClick = async (_: any, node: Node) => {
    setSelectedNode(node);
    const question = node.data as Question;
    console.log("question :", question);
    console.log("questionId utilisé:", question.questionId || question.id);
    console.log("options :", question.options);
    
    // Reset all response states
    setResponseValue("");
    setSelectedOptions([]);
    setMultipleResponses([""]);
    setResponseKeyword("");
    
    // Utiliser questionId en priorité, sinon id
    const questionId = question.questionId || question.id;
    
    // Fetch response and set response value
    try {
      const res = await api_backend.get(
        `/response/get/project/${projectId}/question/${questionId}`
      );
      if (res.data && res.data.length > 0) {
        setResponseValue(res.data[0].label);
      } else {
        setResponseValue("");
      }
    } catch (error: any) {
      console.log("Aucune réponse trouvée pour cette question (404 attendu)");
      setResponseValue("");
    }
    
    modal.openModal();
  };

  // Gestion du clique sur noeud
  const updateNodeStatus = (status: "answered" | "skipped") => {
    if (!selectedNode) return;

    setNodes((prev) => {
      return prev.map((n) => {
        // Mise à jour du node sélectionné
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: { ...n.data, status },
          };
        }
        // Débloque les enfants directs
        if (n.data.parentId?.toString() === selectedNode.id.toString()) {
          return { ...n, hidden: false };
        }
        return n;
      });
    });

    modal.closeModal();
  };

  // Validation d'une réponse
  const handleValidate = async () => {
    if (!selectedNode) return;
    
    const question = selectedNode.data as Question;
    const questionId = question.questionId || question.id;
    
    console.log("Validation - question:", question);
    console.log("Validation - questionId:", questionId);
    console.log("Validation - responseValue:", responseValue);
    console.log("Validation - selectedOptions:", selectedOptions);
    console.log("Validation - multipleResponses:", multipleResponses);
    console.log("Validation - projectId:", projectId);
    
    if (!questionId) {
      console.error("questionId est undefined!");
      return;
    }
    
    // Determine the response label based on question type
    let label = "";
    
    if (question.hasMultipleOpenResponse) {
      // Multiple open responses - join array
      label = multipleResponses.filter(r => r.trim() !== "").join(", ");
    } else if (question.options && question.options.length > 0) {
      // Select options - get selected option labels
      const selectedLabels = selectedOptions
        .map(optId => question.options?.find((_, idx) => idx === optId))
        .filter(Boolean)
        .join(", ");
      label = selectedLabels;
    } else {
      // Single open response
      label = responseValue;
    }
    
    // Validation: ensure label is not empty
    if (!label || label.trim() === "") {
      console.error("La réponse ne peut pas être vide");
      return;
    }
    
    // store response to DB
    try {
      const response = await api_backend.post(`/response/create`, {
        label: label,
        keyword: responseKeyword || null,
        projectId: Number(projectId),
        questionId: Number(questionId),
      });
      
      // Add response to local state to update tree immediately
      setProjectResponses(prev => [...prev, response.data]);
      
      updateNodeStatus("answered");
    } catch (error: any) {
      console.error("Erreur lors de la création de la réponse:", error);
      console.error("Données envoyées:", {
        label: label,
        projectId: Number(projectId),
        questionId: Number(questionId),
      });
      console.error("Réponse du serveur:", error.response?.data);
    }
  };
  // Passer la question
  const handleSkip = () => updateNodeStatus("skipped");

  // Définition des types de noeuds
  const nodeTypes = useMemo(
    () => ({
      question: QuestionNode,
    }),
    []
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={{ type: "smoothstep", style: { stroke: "#272727" } }}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.8,
        }}
      >
        <Controls showInteractive={false}>
          <ControlButton>
            <FontAwesomeIcon icon={Icons.briefcase} />
          </ControlButton>
        </Controls>
      </ReactFlow>
      {/* Renvoie du bon formulaire de réponse */}
      {selectedNode &&
        (() => {
          const question = selectedNode.data as Question;
          let ResponseForm;
          let responseFormProps: any = {};
          
          if (question.shouldMultiply) {
            ResponseForm = () => <div>Question répétée</div>;
          } else if (question.hasMultipleOpenResponse) {
            ResponseForm = ReponsesPlusieurs;
            responseFormProps = {
              value: multipleResponses,
              onChange: setMultipleResponses,
            };
          } else if (question.options && question.options.length > 0) {
            ResponseForm = ReponseSelect;
            responseFormProps = {
              options: (question.options || []).map((opt, index) => ({ 
                label: opt, 
                value: opt, 
                optionId: index, 
                questionId: (question.id ?? 0) as number 
              })),
              value: selectedOptions,
              onChange: setSelectedOptions,
            };
          } else {
            ResponseForm = ReponseUnique;
            responseFormProps = {
              value: responseValue,
              onChange: setResponseValue,
            };
          }

          return (
            <ModalQuestion
              modal={modal}
              question={question.label || "question"}
              questionId={question.id?.toString() || "id"}
              keyword={question.keyword}
              onValidate={handleValidate}
              onSkip={handleSkip}
              onKeywordChange={setResponseKeyword}
            >
              <ResponseForm {...responseFormProps} />
            </ModalQuestion>
          );

        })()}
    </div>
  );
}
