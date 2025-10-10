"use client";

import { PageHeader, Tooltip, Button, Modal, Input } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { useModal } from "@/hooks";
import CreateQuestionForm from "@/components/forms/CreateQuestion";
import { useEffect, useState } from "react";
import api_backend from "@/api/axiosInstance";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  }); // Pagination default Infos

  const modal = useModal();

  useEffect(() => {
    // Fecth questions list
    const fetchQuestions = async () => {
      try {
        const res = await api_backend.get(
          `/question/get?page=${pagination.currentPage}&limit=${pagination.pageSize}`
        );
        setQuestions(res.data.data); // Stores questions
        setPagination(res.data.meta); // Stores pagination data
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuestions();
  }, [pagination.currentPage, pagination.pageSize]);

  return (
    <div className="h-full">
      <PageHeader
        title="Liste des questions"
        description="Consultez la liste des questions et accèdez aux détails"
      />
      <section>
        {/* ADD BTN + SEARCHBAR */}
        <div className="flex items-center justify-between">
          <div>
            <Tooltip content="Ajouter une question" position="rightBottom">
              <Button onClick={modal.openModal} size="sm">
                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                  <FontAwesomeIcon icon={Icons.plus} />
                </div>
                Nouvelle question
              </Button>
            </Tooltip>
            <Modal
              modal={modal}
              title="ajouter une question"
              description="Entrez les informations de la nouvelle question"
            >
              <CreateQuestionForm />
            </Modal>
          </div>
          <Input
            type="search"
            leftIcon={<FontAwesomeIcon icon={Icons.search} />}
            placeholder="Recherchez dans cette liste..."
            className="w-70"
          />
        </div>

        {/* Testing questions list */}
        {questions && questions.length > 0 ? (
          <div>
            {questions.map((q) => (
              <div
                key={q.questionId}
                className="mt-4 p-4 rounded shadow border flex justify-between"
              >
                <div>
                  <span className="mr-4">{q.questionId}</span>
                  <span className="mr-4">{q.label}</span>
                  <span className="mr-4">{q.category}</span>
                  <span className="mr-4">{q.numberOfSelectionableOpt}</span>
                  <span className="mr-4">
                    {q.hasMultipleOpenResponse.toString()}
                  </span>
                  <span className="mr-4">{q.shouldMultiply.toString()}</span>
                  <span className="mr-4">{q.questionIdParent}</span>
                  <span className="mr-4">{q.types.length}</span>
                </div>

                <span
                  onClick={async () => {
                    try {
                      await api_backend.delete(
                        `/question/delete/${q.questionId}`
                      );
                      setQuestions((prev) =>
                        prev.filter(
                          (question) => question.questionId !== q.questionId
                        )
                      );
                      console.log(`question with id: ${q.questionId} deleted`);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  delete
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span>No Questions</span>
        )}

        {/* Test Pagination */}
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.max(prev.currentPage - 1, 1),
              }))
            }
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>

          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <Button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.min(prev.currentPage + 1, prev.totalPages),
              }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </section>
    </div>
  );
}
