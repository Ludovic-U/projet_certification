"use client";

import { useState } from "react";
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

export default function CreateQuestionForm() {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("ideation");
  const [hasMultipleOpenResponse, setHasMultipleOpenResponse] = useState(false);
  const [shouldMultiply, setShouldMultiple] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState([""]);
  const [questionIdParent, setQuestionIdParent] = useState("");

  const categories = [
    { value: "ideation", label: "Idéation" },
    { value: "conception", label: "Conception" },
  ];

  const [selectedType, setSelectedType] = useState<string[]>([]);
  const types = [
    "Startup",
    "PME",
    "ESN",
    "CPF",
    "OPCO",
    "GRETA",
    "Universités et grandes écoles",
    "CFA",
    "Associations de formation continue",
    "Collectivités territoriales",
    "CNRS",
    "ONG",
    "CCI",
    "BTP",
  ];

  const onSubmit = async () => {
    try {
      await api_backend.post(`question/create`, {
        label,
        category,
        numberOfSelectionableOpt: options.length,
        hasMultipleOpenResponse,
        shouldMultiply,
        ...(questionIdParent && { questionIdParent }),
      });

      console.log("Question created successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form
        className="select-none flex flex-col items-center"
        onSubmit={onSubmit}
      >
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Question"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
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
              options={types}
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
            onCheckedChange={setShouldMultiple}
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
        <Button type="submit">Créer</Button>
      </form>
    </>
  );
}
