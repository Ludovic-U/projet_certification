"use client"

import { Handle, NodeProps, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui";

export function LeafNode({ data }: NodeProps) {
    return (
        <Tooltip content={data.label?.toString()} position="right">
            <div className={`cursor-pointer ${
                data.answered 
                ? "h-4 w-4 rounded-full bg-dark border-3 border-dark"
                : "px-3 py-1 rounded-full bg-white shadow-400 hover:bg-lighthover max-w-60"
            }`}>
                {!data.answered && (
                    <p className="text-dark text-sm font-bold font-noto truncate">{data.label?.toString()}</p>
                )}
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
            </div>
        </Tooltip>
    )
};