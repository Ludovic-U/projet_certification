import { Column, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";


export type Project = {
    projectId: number;
    projectName: string;
    ChefDeProjet: string;
    types: string[];
    financeurs: string[];
    goNogo?: string | null;
};

//Nom du projet, nom chef de projet (par défault l’admin_client), Types(s), Financeurs

export const projectsList: Column<Project>[] = [
    {
        key: "goNogo",
        label: "Go/NoGo",
        className: "w-15",
        render: (item) => {
            const value = item.goNogo?.toLowerCase();
            const text = value ? value.toUpperCase() : "-";
            const colorClass =
                value === "go" ? "text-green-600" : value === "nogo" ? "text-red-600" : "text-grey";
            return <span className={`font-bold ${colorClass}`}>{text}</span>;
        }
    },
    {
        key: "projectName",
        label: "Titre",
        render: (item) =>
            <span className="block truncate ">{item.projectName}</span>
    },
    {
        key: "ChefDeProjet",
        label: "Chef de Projet",
        render: (item) =>
            <span className="block truncate ">{item.ChefDeProjet}</span>
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
        render: (item, onEditClick) => (
            <Button
                size="sm"
                variant="primary"
                onClick={(e) => onEditClick?.(item, e)}
            >
                <FontAwesomeIcon icon={Icons.gear} />
                Modifier
            </Button>
        ),
    },
];
