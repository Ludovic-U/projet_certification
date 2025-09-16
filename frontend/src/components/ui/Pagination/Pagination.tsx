"use client";

import * as React from "react";

import { Button } from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

import { PaginationProps } from "./pagination.types";

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className,
}) => {
    if (totalPages < 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className={`flex items-center gap-1 ${className || ""}`}>
            <Button
             variant="secondary"
             size="icon"
             disabled={currentPage === 1}
             onClick={() => onPageChange(currentPage - 1)}
            >
                <FontAwesomeIcon icon={Icons.chevronLeft}/>
            </Button>

            {pages.map((page) => (
                <Button
                 key={page}
                 variant={page === currentPage ? "primary" : "primaryBorder"}
                 size="icon"
                 onClick={() => onPageChange(page)}>
                    {page}
                </Button>
            ))}

            <Button
             variant="secondary"
             size="icon"
             disabled={currentPage === totalPages}
             onClick={() => onPageChange(currentPage + 1)}
            >
                <FontAwesomeIcon icon={Icons.chevronRight}/>
            </Button>

        </div>
    )
}