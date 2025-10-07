"use client";

import { PageHeader, Tooltip, Button, Modal, Input } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { useModal } from "@/hooks";
import CreateQuestionForm from "@/components/forms/CreateQuestion";
import { useEffect, useState } from "react";
import api_backend from "@/api/axiosInstance";

export default function PilotagePage() {
  const [questions, setQuestions] = useState([]);
  const modal = useModal();

  // fetch questions list
  useEffect(() => {
    api_backend.get(`/question/get?page=1&limit=10`).then((res) => {
      setQuestions(res.data.data);
    });
  }, []);

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
            <Tooltip content="Ajouter un client" position="rightBottom">
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
                </div>

                <span
                  onClick={async () => {
                    try {
                      await api_backend.delete(
                        `/question/delete/${q.questionId}`
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
      </section>
    </div>
  );
}
