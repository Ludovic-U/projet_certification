import { Column, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export type Project = {
  id: number;
  title: string;
  type: string;
  step: string;
  contributors: number;
};

export const projectsList: Column<Project>[] = [
        {
            key: "id",
            label: "ID",
            className: "w-15",
            render: (item) =>
                <span className=" font-bold text-grey">{item.id}</span>
        },
        {
            key: "title",
            label: "Titre",
            render: (item) =>
                <span className="block truncate text-left">{item.title}</span> },
        {
            key: "type",
            label: "Type",
            render: (item) =>
                <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.type}</span> },
        {
            key: "step",
            label: "étape",
            render: (item) =>
                <span className="text-primary font-bold uppercase">{item.step}</span> },
        {
            key: "contributors",
            label: "Contributeurs",
            render: (item) => (
                <span className="font-bold">
                    <FontAwesomeIcon className="mr-2" icon={Icons.users} />
                    {item.contributors}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: () => (
                <Button size="sm" variant="iconPrimary">
                    <FontAwesomeIcon icon={Icons.gear} />
                    Paramètres
                </Button>
            ),
        },
    ];