import { Column, Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export type User = {
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    position: string;
    createdAt: Date;
};

export const usersList: Column<User>[] = [
    {
        key: "userid",
        label: "ID",
        className: "w-15",
        render: (item) => (
            <span className="font-bold text-grey">{item.userId}</span>
        ),
    },
    {
        key: "firstname",
        label: "Nom",
        render: (item) => (
            <span className="block truncate text-left">{item.firstname + " " + item.lastname}</span>
        ),
    },
    {
        key: "email",
        label: "Email",
        render: (item) => (
            <span className="block truncate text-left">{item.email}</span>
        ),
    },
    {
        key: "role",
        label: "Rôle",
        render: (item) => (
            <span className="inline-block border px-4 py-1 rounded-full text-xs font-bold">
                {item.role}
            </span>
        ),
    },
    {
        key: "createdAt",
        label: "Créé le",
        render: (item) => (
            <span className="text-primary font-bold">
                {/* {item.createdAt}} */}
            </span>
        ),
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
