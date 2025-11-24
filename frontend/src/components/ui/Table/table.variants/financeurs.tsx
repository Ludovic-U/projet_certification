import api_backend from "@/api/axiosInstance";
import { Column, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export type Financeur = {
  financeurId: number;
  financeurName: string;
  projectNumber: number;
};

export const financeursList: Column<Financeur>[] = [
        {
            key: "id",
            label: "ID",
            className: "w-15",
            render: (item) =>
                <span className=" font-bold text-grey">{item.financeurId}</span>
        },
        {
            key: "Nom",
            label: "Nom",
            render: (item) =>
                <span className="block truncate text-left">{item.financeurName}</span> },
        {
            key: "projects",
            label: "projects",
            render: (item) => (
                <span className="font-bold">
                    <FontAwesomeIcon className="mr-2" icon={Icons.users} />
                    {item.projectNumber}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (item) => (
                <Button
            size="sm"
            variant="primary"
            onClick={async (event) => {
                event.stopPropagation();
                const confirmed = confirm("Êtes-vous sûr de vouloir supprimer ce financeur ?");
                if (confirmed) {
                    try {
                        api_backend.delete(`/financeur/${item.financeurId}`);
                    } catch (error) {
                        console.error("Erreur lors de la suppression :", error);
                    }
                }
            }}
        >
                    <FontAwesomeIcon icon={Icons.trash} />
                    Supprimer
                </Button>
            ),
        },
    ];