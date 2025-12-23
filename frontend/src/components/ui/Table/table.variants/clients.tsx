import { FontAwesomeIcon, Icons } from "@/lib/icons";

import { Column, Button } from "@/components/ui";

export type Client = {
  clientId: number;
  clientName: string;
  description?: string;
  secteur?: string;
  statusJuridique?: string;
  createdAt?: string;
};

export const clientsList: Column<Client>[] = [
        {
          key: "clientId",
          label: "ID",
          className: "w-15",
          render: (item) =>
            <span className=" font-bold text-grey">{item.clientId}</span>
        },
        { 
          key: "clientName",
          label: "Nom",
          render: (item) =>
            <span>{item.clientName}</span> },
        { 
          key: "secteur",
          label: "Secteur",
          render: (item) =>
            <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.secteur || "N/A"}</span> },
        { 
          key: "statusJuridique",
          label: "Statut Juridique",
          render: (item) =>
            <span className="text-sm">{item.statusJuridique || "N/A"}</span> },
        { 
          key: "actions",
          label: "Actions",
          render: () => (
            <Button size="sm" variant="primary">
                <FontAwesomeIcon icon={Icons.gear} />
                Paramètres
            </Button>
          ),
        },
    ];