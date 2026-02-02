

"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button, MultiSelect, Select } from "@/components/ui";
import api_backend from "@/api/axiosInstance";

export type CreateProjectInputs = {
    projectName: string;
    projectManager: number;
    projectDesc: string;
    startDate: string;
    types?: number[];
};

interface CreateProjectFormProps {
    onSubmit: (data: CreateProjectInputs) => void;
    isLoading: boolean;
    apiError?: string;
    clientId: number;
    initialData?: any;
}
// TODO : code redondant avec CreateQuestion.tsx
interface Type {
  typeId: number | string;
  label: string;
}

interface User {
  userId: number;
  firstname: string;
  lastname: string;
  username: string;
}

export default function CreateProjectForm({ onSubmit, isLoading, apiError, clientId, initialData }: CreateProjectFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateProjectInputs>();
    const [typesLabels, setTypesLabels] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
    // fetch Type List and Users by Client
    const fetchData = async () => {
      try {
        const [typesRes, usersRes] = await Promise.all([
          api_backend.get(`/type/get`),
          api_backend.get(`/user/by-client/${clientId}`)
        ]);
        setTypes(typesRes.data);
        setTypesLabels(typesRes.data.map((t: Type) => t.label));
        setUsers(usersRes.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [clientId]);

    // Pré-remplir le formulaire si initialData est fourni
    useEffect(() => {
      if (initialData && types.length > 0) {
        // Formater la date au format YYYY-MM-DD pour l'input date
        let formattedDate = initialData.startDate || "";
        if (formattedDate) {
          formattedDate = new Date(formattedDate).toISOString().split('T')[0];
        }

        const initialTypeIds = Array.isArray(initialData.typeIds)
          ? initialData.typeIds
          : Array.isArray(initialData.types) && typeof initialData.types[0] === "number"
          ? initialData.types
          : [];

        const initialTypeLabels = Array.isArray(initialData.types) && typeof initialData.types[0] === "string"
          ? initialData.types
          : [];

        reset({
          projectName: initialData.projectName || "",
          projectManager: initialData.projectManager !== undefined && initialData.projectManager !== null
            ? Number(initialData.projectManager)
            : undefined,
          projectDesc: initialData.projectDesc || "",
          startDate: formattedDate || "",
          types: initialTypeIds,
        });

        if (initialTypeLabels.length > 0) {
          setSelectedType(initialTypeLabels);
        } else if (initialTypeIds.length > 0) {
          const selectedLabels = initialTypeIds.map((typeId: number) =>
            types.find(t => t.typeId === typeId)?.label
          ).filter(Boolean);
          setSelectedType(selectedLabels);
        }
      }
    }, [initialData, reset, types]);

    return (
        <>
            {apiError && (
                <div className="w-[70%] mb-4 cursor-default">
                    <p className="text-alertdanger text-center text-sm">{apiError}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit((data) => {
                    // Convertir les labels sélectionnés en IDs
                    const typeIds = selectedType.map(label => 
                        types.find(t => t.label === label)?.typeId
                    ).filter(id => id !== undefined).map(id => Number(id));
                    
                    onSubmit({ ...data, types: typeIds });
                })}
                className="flex flex-col gap-8 items-center select-none w-[70%]"
            >
                <div className="flex flex-col gap-6 items-center w-full">
                    <Input
                        {...register("projectName", { required: "Le titre du projet est requis" })}
                        label="Titre"
                        error={errors.projectName?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.projectDiagram} />}
                    />
                    <Select
                        {...register("projectManager", { 
                            required: "Le chef de projet est requis",
                            valueAsNumber: true 
                        })}
                        label="Chef de projet"
                        error={errors.projectManager?.message}
                        leftIcon={<FontAwesomeIcon icon={Icons.userTie} />}
                        placeholder="Sélectionner un chef de projet"
                        options={users.map(user => ({
                            value: user.userId.toString(),
                            label: `${user.firstname} ${user.lastname} (${user.username})`
                        }))}
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
                    {isLoading ? (initialData ? "Modification..." : "Création...") : (initialData ? "Modifier" : "Créer")}
                </Button>
            </form>
        </>
    );
}