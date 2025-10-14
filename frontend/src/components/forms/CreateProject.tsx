// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
// import { Input, Button } from "@/components/ui"


// export default function CreateProjectForm() {

//     return (
//         <>
//             <form className="flex flex-col items-center select-none">
//                 <div className="flex flex-col gap-6 items-center">
//                     <Input label="Titre"/>
//                     <Input label="Chef de projet"/>
//                     <Input label="Description"/>
//                     <Input type="date" className="text-greydarker" label="Date de début"/>
//                 </div>
//                 <Button type="submit" className="mt-8">Créer</Button>
//             </form>
//         </>
//     )
// }

"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons/icons";
import { Input, Button } from "@/components/ui";

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

export default function CreateProjectForm({ onSubmit, isLoading, apiError }: CreateProjectFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectInputs>();

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
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer"}
                </Button>
            </form>
        </>
    );
}