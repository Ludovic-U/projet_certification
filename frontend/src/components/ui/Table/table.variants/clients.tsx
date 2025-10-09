import { FontAwesomeIcon, Icons } from "@/lib/icons";

import { Column, Button } from "@/components/ui";

export type Client = {
  clientId: number;
  clientName: string;
  clientType: string;
  // contact: string;
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
            <span className="block truncate text-left">{item.clientName}</span> },
        { 
          key: "clientType",
          label: "Secteur",
          render: (item) =>
            <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.clientType}</span> },
        // { 
        //   key: "contact",
        //   label: "Contact",
        //   render: (item) =>
        //     <span className="text-primary font-bold uppercase">{item.contact}</span> },
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