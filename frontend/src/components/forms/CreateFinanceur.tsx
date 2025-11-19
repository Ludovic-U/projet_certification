"use client";

import { useForm } from "react-hook-form";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui";

export type CreateFinanceurInputs = {
  FinanceurName: string;
};

interface CreateFinanceurFormProps {
  onSubmit: (data: CreateFinanceurInputs) => void;
  isLoading: boolean;
  apiError?: string;
}

export default function CreateFinanceurForm({ onSubmit, isLoading, apiError }: CreateFinanceurFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFinanceurInputs>();

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
            {...register("FinanceurName", { required: "Le nom du financeur est requis" })}
            label="Nom du financeur"
            error={errors.FinanceurName?.message}
            leftIcon={<FontAwesomeIcon icon={Icons.userTie} />}
          />
        </div>

        <Button type="submit" className="mt-8" disabled={isLoading}>
          {isLoading ? "Création..." : "Créer"}
        </Button>
      </form>
    </>
  );
}
