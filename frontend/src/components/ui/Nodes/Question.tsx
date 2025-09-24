"use client"

import { Handle, NodeProps, Position } from "@xyflow/react"
import { AlignCenter } from "lucide-react";
import { useState } from "react"

type QuestionNodeData = {
    answered?: boolean;
    label?: string;
};

export function QuestionNode({data}: NodeProps) {
    const nodeData = data as QuestionNodeData;
    const [answered, setAnswered] = useState(nodeData.answered ?? false);

    return (
        <div
         onClick={() => setAnswered(!answered)} className="cursor-pointer">
            {answered ? (
                <div className="bg-dark h-4 w-4 rounded-full transition-all"/>
            ) : (
                <div className="bg-transparent border-dark border-3 h-4 w-4 rounded-full transition-all"/>
            )}
            {/* <Handle
             type="source"
             position={Position.Bottom}
             isConnectable={false}
             style={{
                width: 0,
                height: 0,
                background: "transparent",
                border: "none",
             }}/> */}
        </div>

    )
}