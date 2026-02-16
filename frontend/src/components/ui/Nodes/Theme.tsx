"use client"

import { Handle, NodeProps, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui"

export function ThemeNode({ data }: NodeProps) {
    const themeData = data as {
        label?: string;
        isCollapsed?: boolean;
    };

    return (
        <Tooltip className="bg-dark" content={themeData.label?.toString()} position="rightTop">
            <div className="cursor-pointer rounded-full bg-dark text-white px-3 py-1 text-xs font-semibold whitespace-nowrap relative">
                {themeData.label}
                <span className="ml-2 text-[10px] opacity-80">
                    {themeData.isCollapsed ? "(+)" : "(-)"}
                </span>
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
        </Tooltip>
    )
}
