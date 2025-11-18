

"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button, MultiSelect } from "@/components/ui";
import api_backend from "@/api/axiosInstance";

export type CreateProjectInputs = {
    projectName: string;
    projectManager: string;
    projectDesc: string;
    startDate: string;
};

interface CreateProjectFormProps {
    onSubmit: (data: CreateProjectInputs) => void;
    isLoading: boolean;
    apiError?: string;
}
// TODO : code redondant avec CreateQuestion.tsx
interface Type {
  typeId: number | string;
  label: string;
}

export default function CreateProjectForm({ onSubmit, isLoading, apiError }: CreateProjectFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectInputs>();
    const [typesLabels, setTypesLabels] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [types, setTypes] = useState<Type[]>([]);

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
            {apiError && (
                <div className="w-[70%] mb-4 cursor-default">
                    <p className="text-alertdanger text-center text-sm">{apiError}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-8 items-center select-none w-[70%]"
            >
                <div className="flex flex-col gap-6 items-center w-full">
                    <Input
                        {...register("projectName", { required: "Le titre du projet est requis" })}
                        label="Titre"
                        error={errors.projectName?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.projectDiagram} />}
                    />
                    <Input
                        {...register("projectManager", { required: "Le chef de projet est requis" })}
                        label="Chef de projet"
                        error={errors.projectManager?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.userTie} />}
                    />
                    <Input
                        {...register("projectDesc", { required: "La description est requise" })}
                        label="Description"
                        error={errors.projectDesc?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.penRuler} />}
                    />
                    <Input
                        {...register("startDate", { required: "La date de début est requise" })}
                        label="Date de début"
                        type="date"
                        error={errors.startDate?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.calendar} />}
                        className="text-greydarker"
                    />
                    <MultiSelect
                                  className="flex-1 max-w-70"
                                  value={selectedType}
                                  onChange={setSelectedType}
                                  label="Type"
                                  options={typesLabels}
                                />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer"}
                </Button>
            </form>
        </>
    );
}