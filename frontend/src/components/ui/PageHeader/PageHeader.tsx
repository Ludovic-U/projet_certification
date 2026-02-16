"use client";

import { cn } from "@/utils/utils";
import type { PageHeaderProps } from "./pageHeader.types";

export default function PageHeader({ title, description, className } : PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-0.5 mb-2", className)}>
            <h1 className="text-dark font-oswald text-3xl">{title}</h1>
            { description && (
                <p className="text-greydarker font-didact text-lg">{description}</p>
            )}
        </div>
    );
}