"use client";

import { useForm } from "react-hook-form";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui";

export type CreateClientInputs = {
  name: string;
  type: string;
  description?: string;
};

interface CreateClientFormProps {
  onSubmit: (data: CreateClientInputs) => void;
  isLoading: boolean;
  apiError?: string;
}

export default function CreateClientForm({ onSubmit, isLoading, apiError }: CreateClientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateClientInputs>();

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
            {...register("name", { required: "Le nom est requis" })}
            label="Nom"
            error={errors.name?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.home} />}
          />
          <Input
            {...register("type", { required: "Le type est requis" })}
            label="Type"
            error={errors.type?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.userTie} />}
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
