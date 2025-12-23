"use client";

import { useForm } from "react-hook-form";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button, Select } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";

export type CreateClientInputs = {
  clientName: string;
  secteur?: string;
  statusJuridique?: string;
  description?: string;
};

interface CreateClientFormProps {
  onSubmit: (data: CreateClientInputs) => void;
  isLoading: boolean;
  apiError?: string;
}

export default function CreateClientForm({ onSubmit, isLoading, apiError }: CreateClientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateClientInputs>();
  const { config } = useConfig();

  return (
    <>
      {apiError && (
        <div className="w-[70%] mb-4 cursor-default">
          <p className="text-alertdanger text-center text-sm">{apiError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center select-none w-[70%]"
      >
        <div className="flex flex-col gap-6 items-center w-full">
          <Input
            {...register("clientName", { required: "Le nom est requis" })}
            label="Nom"
            error={errors.clientName?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.home} />}
          />
          <Select
            {...register("secteur")}
            label="Secteur"
            error={errors.secteur?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.briefcase} />}
            options={config.types?.secteur_clients || []}
            placeholder="Sélectionner un secteur"
          />
          <Select
            {...register("statusJuridique")}
            label="Statut Juridique"
            error={errors.statusJuridique?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.projectDiagram} />}
            options={config.types?.juridiques_clients || []}
            placeholder="Sélectionner un statut juridique"
          />
          <Input
            {...register("description")}
            label="Description"
            error={errors.description?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.penRuler} />}
          />
        </div>

        <Button type="submit" className="mt-8" disabled={isLoading}>
          {isLoading ? "Création..." : "Créer"}
        </Button>
      </form>
    </>
  );
}
