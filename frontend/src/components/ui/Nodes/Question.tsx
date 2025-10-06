"use client"

import { Node, NodeProps, ViewportPortal, Handle, Position } from "@xyflow/react"
import { useState } from "react"
import { Tooltip } from "@/components/ui"

// type QuestionNodeData = Node<{ answered: boolean }, 'answered'>;

// export function QuestionNode({ data }: NodeProps<QuestionNodeData>)
export function QuestionNode({ data, id }: NodeProps) {
    const qst = "Question fictive à propos du secteur de l'entreprise ?"

    return (
        <Tooltip content={qst} position="right">
            <div className="cursor-pointer bg-dark h-4 w-4 rounded-full transition-all"/>
            <Handle type="source" position={Position.Top}/>
            <Handle type="target" position={Position.Bottom}/>        
        </Tooltip>
        // <div className="bg-transparent border-dark border-3 h-4 w-4 rounded-full transition-all"/>
    )
}