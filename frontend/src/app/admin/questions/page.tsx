"use client";

import {
  PageHeader,
  Tooltip,
  Button,
  Modal,
  Pagination,
  Table,
} from "@/components/ui";
import { questionsList } from "@/components/ui/Table/table.variants/questions";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { useModal } from "@/hooks";
import CreateQuestionForm, { CreateQuestionInputs } from "@/components/forms/CreateQuestion";
import { useEffect, useState } from "react";
import api_backend from "@/api/axiosInstance";
import { Question } from "@/types/question";
import TreeView from "@/components/ui/Tree/TreeView";
import { useProjectQuestion } from "@/hooks/useProjectQuestions";


export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [types, setTypes] = useState<{ typeId: number; label: string }[]>([]);
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string | null>("Général");
  const [selectedOnglet, setSelectedOnglet] = useState<"analyse_existant" | "ideation_projet">("analyse_existant");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  }); // Pagination default Infos
  const modal = useModal();
  const editModal = useModal();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [createInitialValues, setCreateInitialValues] = useState<
    Partial<CreateQuestionInputs> | undefined
  >(undefined);

  // treeview questions state
  const [treeQuestions, setTreeQuestions] = useState<Question[]>([]);
  const { questions: projectQuestions, refetch: refetchProjectQuestions } =
    useProjectQuestion(undefined, { mode: "all", pageSize: 1000 });

  const getQuestionCategoryLabel = (question: Question) => {
    if (typeof question.category === "string") {
      return question.category;
    }
    return "";
  };

  const getQuestionTypeLabels = (question: Question) => {
    return (question.types || [])
      .map((typeItem: any) => {
        if (typeof typeItem === "object" && typeItem.label) {
          return typeItem.label;
        }
        const typeId = typeof typeItem === "object" ? typeItem.typeId : typeItem;
        return types.find((t) => String(t.typeId) === String(typeId))?.label;
      })
      .filter(Boolean) as string[];
  };

  const getNodeTypeFromQuestion = (question: Question): "Theme" | "Question" => {
    const category = (getQuestionCategoryLabel(question) || "").trim().toLowerCase();
    return category === "theme" ? "Theme" : "Question";
  };

  const getSwotCategoryFromQuestion = (
    question: Question
  ): "force" | "faiblesse" | "opportunité" | "menace" | null => {
    const category = (getQuestionCategoryLabel(question) || "").trim().toLowerCase();
    const categoryMap: Record<string, "force" | "faiblesse" | "opportunité" | "menace"> = {
      force: "force",
      forces: "force",
      faiblesse: "faiblesse",
      faiblesses: "faiblesse",
      opportunité: "opportunité",
      opportunités: "opportunité",
      menace: "menace",
      menaces: "menace",
    };
    if (categoryMap[category]) {
      return categoryMap[category];
    }
    return null;
  };

  const mapFormToPayload = (formData: CreateQuestionInputs) => {
    const selectedIds = types
      .filter((typeItem) => formData.typesLabels.includes(typeItem.label))
      .map((typeItem) => typeItem.typeId);

    const normalizedKeyword = formData.keyword.trim();
    const isQuestionNode = formData.nodeType === "Question";
    const label = isQuestionNode
      ? formData.detail?.trim() || normalizedKeyword || "Question"
      : normalizedKeyword || "Theme";
    const category = isQuestionNode
      ? formData.swotCategory ?? null
      : "Theme";

    return {
      label,
      keyword: normalizedKeyword,
      category,
      onglet: selectedOnglet,
      ...(formData.questionIdParent && { questionIdParent: formData.questionIdParent }),
      ...(selectedIds.length > 0 ? { types: selectedIds } : {}),
    };
  };

  useEffect(() => {
    // Filter questions based on selected type and onglet
    let filteredQuestions = projectQuestions;

    // Filter by type label
    if (selectedTypeLabel !== null) {
      const typeIdToLabel = new Map(types.map((t: any) => [t.typeId, t.label]));
      filteredQuestions = filteredQuestions.filter((q: Question) => {
        return q.types?.some((typeItem: any) => {
          if (typeof typeItem === "object" && typeItem?.label) {
            return typeItem.label === selectedTypeLabel;
          }
          return typeIdToLabel.get(typeItem?.typeId ?? typeItem) === selectedTypeLabel;
        });
      });
    }

    // Filter by onglet
    if (selectedOnglet) {
      filteredQuestions = filteredQuestions.filter((q: Question) => {
        return (typeof q.onglet === "string" ? q.onglet : "analyse_existant") === selectedOnglet;
      });
    }

    setTreeQuestions(
      filteredQuestions.map((q: Question) => ({
        ...q,
        status: "skipped",
      }))
    );
  }, [projectQuestions, selectedTypeLabel, selectedOnglet, types]);

  useEffect(() => {
    // Fetch types list
    const fetchTypes = async () => {
      try {
        const res = await api_backend.get("/type/get");
        setTypes(res.data);
        console.log("Types récupérés:", res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    // Fecth questions list
    const fetchQuestions = async () => {
      try {
        const res = await api_backend.get(
          `/question/get?page=${pagination.currentPage}&limit=${pagination.pageSize}`
        );
        setQuestions(res.data.data); // Stores questions
        setPagination((prev) => ({ ...prev, ...res.data.meta })); // Merge pagination data
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuestions();
  }, [pagination.currentPage, pagination.pageSize]);

  const handleDelete = async (questionId: number | string) => {
    try {
      await api_backend.delete(`/question/delete/${questionId}`);
      setQuestions((prev) =>
        prev.filter((q: Question) => q.questionId !== questionId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const columnsWithDelete = questionsList.map((col) =>
    col.key === "actions"
      ? {
          ...col,
          className: "text-right pr-6",
          render: (item: Question) => (
            <div className="flex justify-end pr-6">
              <Button onClick={() => handleDelete(item.questionId)}>
                <FontAwesomeIcon icon={Icons.trash} />
              </Button>
            </div>
          ),
        }
      : col
  );

  return (
    <div className="h-full">
      <PageHeader
        title="Liste des questions"
        description="Consultez la liste des questions et accèdez aux détails"
      />
      
      {/* TYPE FILTER SECTION */}
      <section className="w-full bg-gray-50 px-6 py-4 mb-6 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Types de projets</h3>
        <div className="flex items-center gap-3 overflow-x-auto">
          
          {/* Type Rectangles */}
          {types.map((type: any) => (
            <button
              key={type.typeId}
              onClick={() => setSelectedTypeLabel(type.label)}
              className={`shrink-0 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedTypeLabel === type.label
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </section>

      {/* ONGLET FILTER SECTION */}
      <section className="w-full bg-gray-50 px-6 py-4 mb-6 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Onglet</h3>
        <div className="flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => setSelectedOnglet("analyse_existant")}
            className={`shrink-0 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedOnglet === "analyse_existant"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Analyse de l'existant
          </button>

          <button
            onClick={() => setSelectedOnglet("ideation_projet")}
            className={`shrink-0 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedOnglet === "ideation_projet"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Idéation du projet
          </button>
        </div>
      </section>

      {/* TREEVIEW SECTION */}
      <section className="w-full bg-white px-6 py-4 mb-6 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Arbre des questions</h3>
        <div className="h-125 border border-gray-300 rounded-lg">
          <TreeView
            questions={treeQuestions}
            revealByResponses={false}
            onQuestionClick={async (question) => {
              try {
                const res = await api_backend.get(
                  `/question/get/${question.questionId}`
                );
                setEditingQuestion(res.data || question);
              } catch (error) {
                console.error(error);
                setEditingQuestion(question);
              }
              editModal.openModal();
            }}
          />
        </div>
      </section>

      <section>
        {/* ADD BTN + SEARCHBAR */}
        <div className="flex items-center justify-between">
          <div>
            <Tooltip content="Ajouter une question" position="rightBottom">
              <Button
                onClick={() => {
                  setCreateInitialValues(undefined);
                  modal.openModal();
                }}
                size="sm"
              >
                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                  <FontAwesomeIcon icon={Icons.plus} />
                </div>
                Nouvelle question
              </Button>
            </Tooltip>
            <Modal
              modal={modal}
              title="créer un noeuds"
              description="Entrez les informations du nouveau noeud"
            >
              <CreateQuestionForm
                isLoading={false}
                initialValues={createInitialValues}
                onSubmit={(formData) => {
                  // After creating a question, refresh the questions list
                  const payload = mapFormToPayload(formData);
                  api_backend
                    .post(`/question/create`, payload)
                    .then(() => {
                      modal.closeModal();
                      refetchProjectQuestions();
                      // Refetch questions to update the list
                      return api_backend.get(
                        `/question/get?page=${pagination.currentPage}&limit=${pagination.pageSize}`
                      );
                    })
                    .then((res) => {
                      setQuestions(res.data.data);
                      setPagination((prev) => ({ ...prev, ...res.data.meta }));
                    })
                    .catch((error) => console.error(error));
                }}
                submitLabel="Créer"
              />
            </Modal>
          </div>
        </div>

        <Modal
          modal={editModal}
          title="modifier la question"
          description="Mettez a jour les informations de la question"
        >
          {editingQuestion && (
            <div className="flex flex-col gap-4">
              <Button
                size="sm"
                onClick={() => {
                  setCreateInitialValues({
                    keyword: "",
                    nodeType: "Question",
                    detail: "",
                    swotCategory: null,
                    questionIdParent: String(editingQuestion.questionId),
                    typesLabels: getQuestionTypeLabels(editingQuestion),
                  });
                  editModal.closeModal();
                  modal.openModal();
                }}
              >
                Ajouter question enfant
              </Button>
              <CreateQuestionForm
                isLoading={false}
                initialValues={{
                  keyword: editingQuestion.keyword || "",
                  nodeType: getNodeTypeFromQuestion(editingQuestion),
                  detail: editingQuestion.label || "",
                  swotCategory: getSwotCategoryFromQuestion(editingQuestion),
                  questionIdParent:
                    editingQuestion.parentId !== null &&
                    editingQuestion.parentId !== undefined
                      ? String(editingQuestion.parentId)
                      : (editingQuestion as any).questionIdParent?.toString() || "",
                  typesLabels: getQuestionTypeLabels(editingQuestion),
                }}
                submitLabel="Mettre a jour"
                secondaryAction={
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={async () => {
                      await handleDelete(editingQuestion.questionId);
                      editModal.closeModal();
                      setEditingQuestion(null);
                      refetchProjectQuestions();
                    }}
                  >
                    Supprimer
                  </Button>
                }
                onSubmit={(formData) => {
                  const payload = mapFormToPayload(formData);
                  api_backend
                    .patch(`/question/update/${editingQuestion.questionId}`, payload)
                    .then(() => {
                      editModal.closeModal();
                      setEditingQuestion(null);
                      refetchProjectQuestions();
                      return api_backend.get(
                        `/question/get?page=${pagination.currentPage}&limit=${pagination.pageSize}`
                      );
                    })
                    .then((res) => {
                      setQuestions(res.data.data);
                      setPagination((prev) => ({ ...prev, ...res.data.meta }));
                    })
                    .catch((error) => console.error(error));
                }}
              />
            </div>
          )}
        </Modal>

        {questions && questions.length > 0 ? (
          <div>
            <Table
              data={questions.map((q: Question) => {
                // Map type objects/IDs to labels
                const typeLabels = q.types?.map((typeItem: any) => {
                  // If it's an object with label, use the label directly
                  if (typeof typeItem === 'object' && typeItem.label) {
                    return typeItem.label;
                  }
                  // Otherwise, find by ID
                  const type = types.find((t: any) => String(t.typeId) === String(typeItem.typeId || typeItem));
                  return type?.label || String(typeItem.typeId || typeItem);
                }) || [];
                
                return {
                  ...q,
                  id: q.questionId,
                  typeLabels,
                };
              })}
              columns={columnsWithDelete as any}
            />
          </div>
        ) : (
          <span>No Questions</span>
        )}

        <Pagination
          className="mt-6 flex items-center justify-center"
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
        />
      </section>
    </div>
  );
}
