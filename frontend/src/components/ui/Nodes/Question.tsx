"use client"

import { Node, NodeProps, ViewportPortal } from "@xyflow/react"
import { useState } from "react"
import { Tooltip } from "@/components/ui"

type QuestionNodeData = Node<{ answered: boolean }, 'answered'>;

export function QuestionNode({ data }: NodeProps<QuestionNodeData>) {
    const qst = "Question fictive à propos du secteur de l'entreprise ?"

    return (
        <Tooltip content={qst} position="right">
            <div className="bg-dark h-4 w-4 rounded-full transition-all"/>
        </Tooltip>

        // <div className="bg-transparent border-dark border-3 h-4 w-4 rounded-full transition-all"/>
    )
}