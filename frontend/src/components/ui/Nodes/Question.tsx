"use client"

import { NodeProps, Handle, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui"
import type { MouseEvent } from "react"


export function QuestionNode({ data }: NodeProps) {
    const questionData = data as {
        status?: "pending" | "answered" | "skipped";
        label?: string;
        keyword?: string;
        isVirtualRoot?: boolean;
        isCollapsed?: boolean;
        isCollapsible?: boolean;
        nodeId?: string;
        onToggleCollapse?: (nodeId: string) => void;
    };
    const isCollapsible = questionData.isCollapsible ?? true;
    
    const statusStyle = {
        pending: "bg-white border-2 border-dark text-dark",
        answered:"bg-green-500 border-2 border-green-500 text-white",
        skipped: "bg-gray-500 border-2 border-gray-500 text-white",
    }

    const bg = questionData.isVirtualRoot 
        ? "bg-dark border-2 border-dark text-white" 
        : statusStyle[questionData.status || "pending"];

    const collapseButtonStyle = (() => {
        if (questionData.isCollapsed) {
            if (questionData.status === "answered") {
                return "border-2 border-green-500 bg-green-500 text-white";
            }
            if (questionData.status === "skipped") {
                return "border-2 border-gray-500 bg-gray-500 text-white";
            }
            return "border-2 border-dark bg-dark text-white";
        }

        if (questionData.status === "answered") {
            return "border-2 border-green-500 bg-white text-green-600 hover:bg-green-50";
        }
        if (questionData.status === "skipped") {
            return "border-2 border-gray-500 bg-white text-gray-600 hover:bg-gray-50";
        }
        return "border-2 border-dark bg-white text-dark hover:bg-gray-100";
    })();

    const handleCollapseClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!questionData.nodeId || !questionData.onToggleCollapse) return;
        questionData.onToggleCollapse(questionData.nodeId);
    };

    return (
        <Tooltip className="bg-dark" content={data.label?.toString()} position="rightTop">
            <div className={`relative flex items-center gap-2 ${questionData.isVirtualRoot ? "cursor-default" : "cursor-pointer"}`}>
                <div className={`relative rounded-full px-3 py-1 text-xs font-semibold leading-none whitespace-nowrap transition-all duration-300 ease-in-out ${bg}`}>
                    {questionData.keyword?.toString() || "Question"}
                    {questionData.status === "pending" && !questionData.isVirtualRoot && (
                        <span className="absolute inset-0 rounded-full border-2 border-dark animate-ping"></span>
                    )}
                    <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        opacity: 0,
                        pointerEvents: "none",
                        position: "absolute",
                        left: "-1px",
                        top: "50%",
                        transform: "translateY(-50%)"
                    }}
                    />
                    <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        opacity: 0,
                        pointerEvents: "none",
                        position: "absolute",
                        right: "-1px",
                        top: "50%",
                        transform: "translateY(-50%)"
                    }}
                    />
                </div>
                {isCollapsible && !questionData.isVirtualRoot && (
                    <button
                        type="button"
                        onClick={handleCollapseClick}
                        onPointerDown={(event) => event.stopPropagation()}
                        className={`nodrag nopan min-w-6 h-6 rounded-full px-2 text-xs font-semibold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-dark ${collapseButtonStyle}`}
                        aria-label={questionData.isCollapsed ? "Déplier la question" : "Replier la question"}
                        title={questionData.isCollapsed ? "Déplier" : "Replier"}
                    >
                        {questionData.isCollapsed ? "+" : "-"}
                    </button>
                )}
            </div>
        </Tooltip>
    )
}