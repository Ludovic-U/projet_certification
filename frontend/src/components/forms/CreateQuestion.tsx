"use client";

// import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import {
  Input,
  Button,
  Toggle,
  DynamicOptions,
  MultiSelect,
  Select,
} from "@/components/ui";
import api_backend from "@/api/axiosInstance";

export type CreateQuestionInputs = {
  label: string;
  keyword: string;
  category: string;
  hasMultipleOpenResponse: boolean;
  shouldMultiply: boolean;
  allowMultiple: boolean;
  options: string[];
  questionIdParent?: string;
  typesLabels: string[]; // selected type labels from MultiSelect
};

interface Type {
  typeId: number | string;
  label: string;
}

interface CreateQuestionFormProps {
    onSubmit: (data: CreateQuestionInputs) => void;
    isLoading: boolean;
    apiError?: string;
}

export default function CreateQuestionForm({ onSubmit, isLoading, apiError }: CreateQuestionFormProps) {
  // const { register, handleSubmit, formState: { errors } } = useForm<CreateQuestionInputs>();
  const [label, setLabel] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("ideation");
  const [hasMultipleOpenResponse, setHasMultipleOpenResponse] = useState(false);
  const [shouldMultiply, setShouldMultiply] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [questionIdParent, setQuestionIdParent] = useState("");

  //TODO: fetch categories from backend
  const categories = [
    { value: "ideation", label: "Idéation" },
    { value: "conception", label: "Conception" },
  ];

  const [types, setTypes] = useState<Type[]>([]);
  const [typesLabels, setTypesLabels] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  const handleSubmit = async (data: CreateQuestionInputs) => {
    // Get the IDs of selected types
    const selectedIds = types
      .filter((t) => data.typesLabels.includes(t.label))
      .map((t) => t.typeId);
    try {
      await api_backend.post(`question/create`, {
        label: data.label,
        category: data.category,
        numberOfSelectionableOpt: data.options.length,
        hasMultipleOpenResponse: data.hasMultipleOpenResponse,
        shouldMultiply: data.shouldMultiply,
        ...(data.questionIdParent && { questionIdParent: data.questionIdParent }),
        ...(data.options && { options: data.options }),
        ...(selectedIds && { types: selectedIds }),
      })
      .then(response => {console.log(response)});

      console.log("Question created successfully");
      console.log(data.options)
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // fetch Type List
    const fetchTypeList = async () => {
      try {
        const res = await api_backend.get(`/type/get`);
        setTypes(res.data); // Stores types with IDs and labels.
        setTypesLabels(res.data.map((t: Type) => t.label)); // Stores labels of types.
      } catch (error) {
        console.log(error);
      }
    };

    fetchTypeList();
  }, []);

  return (
    <>
      <form
        className="select-none flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit({
            label,
            keyword,
            category,
            hasMultipleOpenResponse,
            shouldMultiply,
            allowMultiple,
            options,
            questionIdParent,
            typesLabels: selectedType,
          });
        }}
      >
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Question"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Input
                label="Mot Clé"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
          <div className="flex gap-3">
            <Select
              className="flex-1"
              label="Catégorie"
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <MultiSelect
              className="flex-1 max-w-70"
              value={selectedType}
              onChange={setSelectedType}
              label="Type"
              options={typesLabels}
            />
          </div>
        </div>

        <div className="w-100 space-y-3 my-4">
          <Toggle
            label="Autoriser plusieurs réponses libres."
            helperText="Le client pourra saisir plus d'une réponse écrite."
            checked={hasMultipleOpenResponse}
            onCheckedChange={setHasMultipleOpenResponse}
          />

          <Toggle
            label="Répéter la question."
            helperText="La question sera posée une fois pour chaque élément défini dans la question précédente."
            checked={shouldMultiply}
            onCheckedChange={setShouldMultiply}
          />

          <Toggle
            checked={allowMultiple}
            onCheckedChange={setAllowMultiple}
            label="Proposer une liste d'options"
            helperText="Activez pour définir des choix que le client pourra sélectionner."
          />

          {allowMultiple && (
            <DynamicOptions
              labelPrefix="Option"
              values={options}
              onChange={setOptions}
            />
          )}
        </div>
        <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer"}
                </Button>
      </form>
    </>
  );
}
