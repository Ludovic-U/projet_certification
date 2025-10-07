"use client"

import { NodeProps, Handle, Position } from "@xyflow/react"
import { Tooltip } from "@/components/ui"

// type QuestionNodeData = Node<{ answered: boolean }, 'answered'>;

// export function QuestionNode({ data }: NodeProps<QuestionNodeData>)
export function QuestionNode({ data }: NodeProps) {
    const qst = "Question fictive à propos du secteur de l'entreprise ?"

    return (
        <Tooltip content={qst} position="right">
            <div className="relative cursor-pointer bg-dark h-4 w-4 rounded-full transition-all">
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
        </Tooltip>
    )
}