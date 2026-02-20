"use client"

import { Handle, NodeProps, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui"

export function ResponseNode({ data }: NodeProps) {
    const responseData = data as {
        label?: string;
        keyword?: string;
    };

    const tooltipLabel = responseData.keyword
        ? `${responseData.label ?? "Réponse"} • ${responseData.keyword}`
        : (responseData.label ?? "Réponse");

    return (
        <Tooltip className="bg-dark" content={tooltipLabel} position="rightTop">
            <div className="cursor-pointer bg-white border border-dark rounded-lg px-2 py-1 min-w-28 max-w-40 relative">
                <p className="text-[11px] font-medium text-dark truncate">
                    {responseData.label || "Réponse"}
                </p>
                {responseData.keyword && (
                    <p className="text-[10px] text-greydarker truncate">{responseData.keyword}</p>
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
            </div>
        </Tooltip>
    )
}
