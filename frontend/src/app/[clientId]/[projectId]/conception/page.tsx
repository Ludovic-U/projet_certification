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

function MyTooltipContent({ data }: { data: any }) {
    if (!data) return null;

    return (
        <div className="data">
            <div className="text">
                <span className="caption">{data.type}:</span>
                {data.text}
            </div>
            <div className="text">
                <span className="caption">start:</span>
                {format(data.start, mask)}
            </div>
            {data.end && (
                <div className="text">
                    <span className="caption">end:</span>
                    {format(data.end, mask)}
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
    const keys = ["text", "type", "start", "end", "duration", "progress", "details"];
    const editorItems = keys.map((key) => getEditorItems().find((op: any) => op.key === key)).filter(Boolean);

    // Add a custom field to assign the responsible user
    editorItems.splice(3, 0, {
        key: 'to',
        type: 'select',
        label: 'Goes to',
        options: data.users,
        config: { placeholder: 'Select the person' },
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