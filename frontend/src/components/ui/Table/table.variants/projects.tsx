import { Column, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";


export type Project = {
  projectId: number;
  projectName: string;
  ChefDeProjet: string;
  types: string[];
  financeurs: string[];
};

//Nom du projet, nom chef de projet (par défault l’admin_client), Types(s), Financeurs

export const projectsList: Column<Project>[] = [
    {
        key: "projectId",
        label: "ID",
        className: "w-15",
        render: (item) =>
            <span className="font-bold text-grey">{item.projectId}</span>
    },
    {
        key: "projectName",
        label: "Titre",
        render: (item) =>
            <span className="block truncate text-left">{item.projectName}</span>
    },
    {
        key: "ChefDeProjet",
        label: "Chef de Projet",
        render: (item) =>
            <span className="block truncate text-left">{item.ChefDeProjet}</span>
    },
    {
        key: "types",
        label: "Type(s)",
        render: (item) =>
            <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.types.join(", ")}</span>
    },
    {
        key: "financeurs",
        label: "Financeur(s)",
        render: (item) =>
            <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.financeurs.join(", ")}</span>
    },
    {
        key: "actions",
        label: "Actions",
        render: () => (
            <Button size="sm" variant="primary">
                <FontAwesomeIcon icon={Icons.gear} />
                Modifier
            </Button>
        ),
    },
];
