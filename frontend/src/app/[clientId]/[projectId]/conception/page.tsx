// @ts-nocheck
"use client";

import { PageHeader } from "@/components/ui";
import { useConfig } from "@/context/ConfigContext";
import { useMemo, useState } from 'react';
import {
  Gantt,
  WillowDark,
  Editor,
  getEditorItems,
  ContextMenu,
  Tooltip
} from "@svar-ui/react-gantt";
import { format } from "date-fns";
import "@svar-ui/react-gantt/all.css";
import { getData } from '../data';

const mask = "yyyy.MM.dd";

// this is for the tooltip content when you hover on a task
function MyTooltipContent({ data }: { data: any }) {
    if (!data) return null;

    const { users } = getData();
    const assignees = [data.to1, data.to2].map(id => users.find(u => u.id === id)?.label).filter(Boolean).join(', ');

    return (
        <div className="data bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            <div className="text mb-2">
                <span className="caption font-semibold text-gray-700">{data.type}:</span>
                <span className="ml-1 text-gray-900">{data.details}</span>
            </div>
            <div className="text mb-2">
                <span className="caption font-semibold text-gray-700">Assigned to:</span>
                <span className="ml-1 text-gray-900">{assignees || 'N/A'}</span>
            </div>
            <div className="text mb-2">
                <span className="caption font-semibold text-gray-700">Start:</span>
                <span className="ml-1 text-gray-900">{(() => { try { return format(data.start, mask); } catch { return 'N/A'; } })()}</span>
            </div>
            {data.end && (
                <div className="text">
                    <span className="caption font-semibold text-gray-700">End:</span>
                    <span className="ml-1 text-gray-900">{(() => { try { return format(data.end, mask); } catch { return 'N/A'; } })()}</span>
                </div>
            )}
        </div>
    );
}

export default function ConceptionPage() {
    const { config } = useConfig();
    const [api, setApi] = useState();

    const data = useMemo(() => getData(), []);

    const columns = [
        { id: 'text', header: 'Task name', width: 210 },
        {
            id: 'start',
            header: 'Start date',
            width: 106,
            align: 'center',
        },
        { id: 'add-task', header: '', width: 40, align: 'center' },
    ];

    // Define only the fields you want to include
    const keys = ["text", "type", "start", "end", "duration", "progress", "details", "to1", "to2"];
    const editorItems = keys.map((key) => getEditorItems().find((op: any) => op.key === key)).filter(Boolean);

    // Add custom fields to assign responsible users
    editorItems.splice(3, 0, {
        key: 'to1',
        type: 'select',
        label: 'Assigned to 1',
        options: data.users,
        comp: 'select',
    });
    editorItems.splice(4, 0, {
        key: 'to2',
        type: 'select',
        label: 'Assigned to 2',
        options: data.users,
        comp: 'select',
    });

    const bottomBar = {
        items: [
            { comp: "button", type: "secondary", text: "Close", id: "close" },
            { comp: "spacer" },
            { comp: "button", type: "danger", text: "Delete", id: "delete" },
            { comp: "button", type: "primary", text: "Save", id: "save" },
        ],
    };

    const contextMenuOptions = [
        {
            id: "add-task",
            text: "Add",
            icon: "wxi-plus",
            data: [{ id: "add-task:child", text: "Child task" }],
        },
        { type: "separator" },
        {
            id: "edit-task",
            text: "Edit",
            icon: "wxi-edit",
        },
        { id: "delete-task", text: "Delete", icon: "wxi-delete" },
    ];

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Titre" description={config?.subtitles.conception} />
            <section className="flex-1 p-4">
                <WillowDark>
                    <Tooltip api={api} content={MyTooltipContent}>
                        <ContextMenu api={api} options={contextMenuOptions}>
                            <Gantt
                                init={setApi}
                                tasks={data.tasks}
                                links={data.links}
                                scales={data.scales}
                                columns={columns}
                                editable={true}
                            />
                        </ContextMenu>
                    </Tooltip>
                    {api && (
                        <Editor
                            api={api}
                            items={editorItems}
                            bottomBar={bottomBar}
                            topBar={false}
                            placement="modal"
                        />
                    )}
                </WillowDark>
            </section>
        </div>
    );
}