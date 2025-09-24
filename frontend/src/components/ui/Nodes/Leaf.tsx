"use client"

import { Handle, NodeProps, Position } from "@xyflow/react"
import { AlignCenter } from "lucide-react";
import { useState } from "react"
import { Tooltip } from "../Tooltip";

type LeafNodeData = {
    answered?: boolean
    label?: string;
}

export function LeafNode({data}: NodeProps) {
    const nodeData = data as LeafNodeData;
    const [answered, setAnswered] = useState(nodeData.answered ?? false);
    const lab = "Lorsque votre nananani, pensez-vous pouvoir nanana "

    return (
        <div className="px-3 py-1 rounded-full bg-white shadow-400 hover:bg-lighthover cursor-pointer max-w-60">
            <p className="text-dark text-sm font-bold font-noto truncate">{lab}</p>
        </div>
    )
}