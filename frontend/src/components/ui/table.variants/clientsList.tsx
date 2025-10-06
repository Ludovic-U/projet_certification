import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

import { Button, Column } from "@/components/ui";

export type Client = {
  id: number;
  name: string;
  sector: string;
  contact: string;
};

export const clientsList: Column<Client>[] = [
        {
          key: "id",
          label: "ID",
          className: "w-15",
          render: (item) =>
            <span className=" font-bold text-grey">{item.id}</span>
        },
        { 
          key: "name",
          label: "Nom",
          render: (item) =>
            <span className="block truncate text-left">{item.name}</span> },
        { 
          key: "sector",
          label: "Secteur",
          render: (item) =>
            <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.sector}</span> },
        { 
          key: "contact",
          label: "Contact",
          render: (item) =>
            <span className="text-primary font-bold uppercase">{item.contact}</span> },
        { 
          key: "actions",
          label: "Actions",
          render: () => (
            <Button size="sm" variant="primary">
                <FontAwesomeIcon icon={faGear} />
                Paramètres
            </Button>
          ),
        },
    ];