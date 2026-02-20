"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Input, Button, Radio, RadioGroup, MultiSelect } from "@/components/ui";
import api_backend from "@/api/axiosInstance";

export type CreateQuestionInputs = {
  keyword: string;
  nodeType: "Theme" | "Question";
  detail?: string;
  swotCategory?: "force" | "opportunité" | "faiblesse" | "menace" | null;
  questionIdParent?: string;
  typesLabels: string[];
};

interface Type {
  typeId: number | string;
  label: string;
}

interface CreateQuestionFormProps {
  onSubmit: (data: CreateQuestionInputs) => void;
  isLoading: boolean;
  apiError?: string;
  initialValues?: Partial<CreateQuestionInputs>;
  submitLabel?: string;
  secondaryAction?: ReactNode;
}

export default function CreateQuestionForm({
  onSubmit,
  isLoading,
  apiError,
  initialValues,
  submitLabel,
  secondaryAction,
}: CreateQuestionFormProps) {
  const [keyword, setKeyword] = useState("");
  const [nodeType, setNodeType] = useState<"Theme" | "Question">("Theme");
  const [detail, setDetail] = useState("");
  const [swotCategory, setSwotCategory] = useState<
    "force" | "opportunité" | "faiblesse" | "menace" | null
  >(null);
  const [questionIdParent, setQuestionIdParent] = useState("");
  const [typesLabels, setTypesLabels] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  const handleSubmit = async (data: CreateQuestionInputs) => {
    onSubmit(data);
  };

  useEffect(() => {
    const fetchTypeList = async () => {
      try {
        const res = await api_backend.get(`/type/get`);
        setTypesLabels(res.data.map((t: Type) => t.label));
      } catch (error) {
        console.log(error);
      }
    };

    fetchTypeList();
  }, []);

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    if (typeof initialValues.keyword === "string") {
      setKeyword(initialValues.keyword);
    }
    if (initialValues.nodeType === "Theme" || initialValues.nodeType === "Question") {
      setNodeType(initialValues.nodeType);
    }
    if (typeof initialValues.detail === "string") {
      setDetail(initialValues.detail);
    }
    if (initialValues.swotCategory === null) {
      setSwotCategory(null);
    } else if (
      initialValues.swotCategory === "force" ||
      initialValues.swotCategory === "faiblesse" ||
      initialValues.swotCategory === "opportunité" ||
      initialValues.swotCategory === "menace"
    ) {
      setSwotCategory(initialValues.swotCategory);
    } else if (
      initialValues.swotCategory === "forces" ||
      initialValues.swotCategory === "faiblesses" ||
      initialValues.swotCategory === "opportunités" ||
      initialValues.swotCategory === "menaces"
    ) {
      const legacyToSingular = {
        forces: "force",
        faiblesses: "faiblesse",
        opportunités: "opportunité",
        menaces: "menace",
      } as const;
      setSwotCategory(legacyToSingular[initialValues.swotCategory]);
    }
    if (typeof initialValues.questionIdParent === "string") {
      setQuestionIdParent(initialValues.questionIdParent);
    }
    if (Array.isArray(initialValues.typesLabels)) {
      setSelectedType(initialValues.typesLabels);
    }
  }, [initialValues]);

  return (
    <>
      <form
        className="select-none flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit({
            keyword,
            nodeType,
            detail,
            swotCategory,
            questionIdParent,
            typesLabels: selectedType,
          });
        }}
      >
        <div className="space-y-5 w-full">
          <div>
            <p className="mb-2 text-sm font-medium">Type de noeud</p>
            <RadioGroup
              name="nodeType"
              value={nodeType}
              onValueChange={(value) => setNodeType(value as "Theme" | "Question")}
              className="flex items-center gap-4"
            >
              <Radio value="Theme" label="Theme" />
              <Radio value="Question" label="Question" />
            </RadioGroup>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Mot Clé"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <MultiSelect
                className="mt-3"
                value={selectedType}
                onChange={setSelectedType}
                label="Type de projet"
                options={typesLabels}
              />
            </div>
            <Input
              className="w-28"
              label="ID parent"
              value={questionIdParent}
              onChange={(e) => {
                setQuestionIdParent(e.target.value);
              }}
            />
          </div>

          {nodeType === "Question" && (
            <div className="space-y-4">
              <Input
                label="Détails"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />

              <div>
                <p className="mb-2 text-sm font-medium">Catégorie SWOT</p>
                <RadioGroup
                  name="swotCategory"
                  value={swotCategory ?? "none"}
                  onValueChange={(value) =>
                    setSwotCategory(
                      value === "none"
                        ? null
                        : (value as "force" | "faiblesse" | "opportunité" | "menace")
                    )
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  <Radio value="none" label="Aucune" />
                  <Radio value="force" label="force" />
                  <Radio value="opportunité" label="opportunité" />
                  <Radio value="faiblesse" label="faiblesse" />
                  <Radio value="menace" label="menace" />
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création..." : submitLabel || "Créer"}
          </Button>
          {secondaryAction}
        </div>
      </form>
    </>
  );
}
