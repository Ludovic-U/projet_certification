import { Column, Button } from "@/components/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faUsers } from "@fortawesome/free-solid-svg-icons";
// THIS FILE IS NOT USED
export type Project = {
  projectId: number;
  projectName: string;
  type: string;
  projectStep: string;
  contributors: number;
};

export const projectsList: Column<Project>[] = [
        {
            key: "id",
            label: "ID",
            className: "w-15",
            render: (item) =>
                <span className=" font-bold text-grey">{item.projectId}</span>
        },
        {
            key: "title",
            label: "Titre",
            render: (item) =>
                <span className="block truncate text-left">{item.projectName}</span> },
        {
            key: "type",
            label: "Type",
            render: (item) =>
                <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">{item.type} "Test" </span> },
        {
            key: "step",
            label: "étape",
            render: (item) =>
                <span className="text-primary font-bold uppercase">{item.projectStep}</span> },
        {
            key: "contributors",
            label: "Contributeurs",
            render: (item) => (
                <span className="font-bold">
                    <FontAwesomeIcon className="mr-2" icon={faUsers} />
                    {item.contributors} "Test"
                </span>
            )
        },
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