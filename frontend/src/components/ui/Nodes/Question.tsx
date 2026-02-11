"use client"

import { NodeProps, Handle, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui"
import { cn } from "@/utils/utils";


export function QuestionNode({ data }: NodeProps) {
    const questionData = data as {
        status?: "pending" | "answered" | "skipped";
        label?: string;
        keyword?: string;
        isVirtualRoot?: boolean;
    };
    
    const statusStyle = {
        pending: "bg-transparent border-3 border-dark",
        answered:"bg-green-500 border-3 border-green-500",
        skipped: "bg-gray-500 border-3 border-gray-500",
    }

    const bg = statusStyle[questionData.status || "pending"];

    return (
        <Tooltip className="bg-dark" content={data.label?.toString()} position="rightTop">
            <div className={`relative ${questionData.isVirtualRoot ? "cursor-default" : "cursor-pointer"} flex flex-col items-center gap-1`}>
                {questionData.keyword && (
                    <span className="text-xs font-medium text-dark whitespace-nowrap">
                        {questionData.keyword}
                    </span>
                )}
                <div className="relative">
                    {questionData.status === "pending" && (
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-dark animate-ping"></span>
                    )}
                    <div className={`relative h-4 w-4 rounded-full transition-all duration-300 ease-in-out ${bg}`}>
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
                </div>
            </div>
        </Tooltip>
    )
}