"use client"

import { NodeProps, Handle, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui"
import { cn } from "@/utils/utils";


export function QuestionNode({ data }: NodeProps) {
    const questionData = data as { status?: "pending" | "answered" | "skipped"; label?:string };
    
    const statusStyle = {
        pending: "bg-transparent border-3 border-dark",
        answered:"bg-green-500 border-3 border-green-500",
        skipped: "bg-gray-500 border-3 border-gray-500",
    }

    const bg = statusStyle[questionData.status || "pending"];

    return (
        <Tooltip className="bg-dark" content={data.label?.toString()} position="rightTop">
            <div className={`relative cursor-pointer h-4 w-4 `}>
                {questionData.status === "pending" && (
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-dark animate-ping"></span>
                )}
                <div className={`relative h-4 w-4 rounded-full transition-all duration-300 ease-in-out ${bg}`}>
                    <Handle
                    type="target"
                    position={Position.Top}
                    style={{
                        opacity: 0,
                        pointerEvents: "none",
                        position: "absolute",
                        top: "-1px",
                        left: "50%",
                        transform: "translateX(-50%)"
                    }}
                    />
                    <Handle
                    type="source"
                    position={Position.Bottom}
                    style={{
                        opacity: 0,
                        pointerEvents: "none",
                        position: "absolute",
                        bottom: "-1px",
                        left: "50%",
                        transform: "translateX(-50%)"
                    }}
                    />
                </div>
            </div>
        </Tooltip>
    )
}