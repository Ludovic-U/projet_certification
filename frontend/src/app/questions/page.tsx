"use client";

import { PageHeader, Tooltip, Button, Modal, Input, Pagination, Table } from "@/components/ui";
import { questionsList } from "@/components/ui/Table/table.variants/questions";
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

  const handleDelete = async (questionId: number) => {
    try {
      await api_backend.delete(`/question/delete/${questionId}`);
      setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
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
            <Button
            onClick={() => handleDelete(item.questionId)}
            >
              <FontAwesomeIcon icon={Icons.trash}/>
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

        {questions && questions.length > 0 ? (
          <div>
            <Table
             data={questions.map((q) => ({ ...q, id: q.questionId}))}
             columns={columnsWithDelete}/>
          </div>
        ) : (
          <span>No Questions</span>
        )}

        <Pagination
         className="mt-6 flex items-center justify-center"
         currentPage={pagination.currentPage}
         totalPages={pagination.totalPages}
         onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page,}))}
        />
      </section>
    </div>
  );
}
