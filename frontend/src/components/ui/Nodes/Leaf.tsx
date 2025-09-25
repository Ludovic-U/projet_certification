"use client"

import { Node, NodeProps, Position, NodeToolbar, NodeToolbarProps } from "@xyflow/react"
import { Tooltip } from "@/components/ui";

// 
type LeafNodeData = Node<{ answered: boolean }, 'answered'>;

export function LeafNode({ data }: NodeProps<LeafNodeData>) {
    const qst = "Lorsque votre nananani, pensez-vous pouvoir nanana"

    return (
        <Tooltip content={qst} position="right">
            <div className="px-3 py-1 rounded-full bg-white shadow-400 hover:bg-lighthover cursor-pointer max-w-60">
                <p className="text-dark text-sm font-bold font-noto truncate">{qst}</p>
            </div>
        </Tooltip>
    )
};