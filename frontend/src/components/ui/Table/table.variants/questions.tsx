import { Icons, FontAwesomeIcon } from "@/lib/icons";
import { Column, Button } from "@/components/ui"
import { Question } from "@/types/question";

export const questionsList: Column<Question>[] = [
    {
        key: "questionId",
        label: "ID",
        className: "w-15",
        render: (item) =>
            <span className="font-bold text-grey">{item.questionId}</span>,
    },
    {
        key: "label",
        label: "Question",
        render: (item) =>
            <span className="block truncate text-left">{item.label}</span>
    },
    {
        key: "category",
        label: "Catégorie",
        render: (item) =>
            <span className="inline-block border px-3 py-1 rounded-full text-xs font-bold">{item.category}</span>
    },
    {
        key: "actions",
        label: "Actions",
        render: (item) => (
            <div className="flex gap-2 justify-center">
                <Button size="sm" variant="primary">
                    <FontAwesomeIcon icon={Icons.gear} />
                    Paramètres
                </Button>
            </div>
        ),
    }
]