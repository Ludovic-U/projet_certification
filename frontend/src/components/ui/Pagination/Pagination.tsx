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

    const getVisiblePages = (currentPage: number, totalPages: number) => {
        const visible = 2;
        const pages: (number | string)[] = [];

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - visible && i <= currentPage + visible)
            ) {
                pages.push(i);
            } else if (
                (i === currentPage - visible - 1 && i > 1) ||
                (i === currentPage + visible + 1 && i < totalPages)
            ) {
                pages.push("...")
            }
        }
        return pages;
    }

    const pages = getVisiblePages(currentPage, totalPages);
    // const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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

            {pages.map((page, index) =>
                typeof page === "number" ? (
                    <Button
                     key={page}
                     variant={page === currentPage ? "primary" : "primaryBorder"}
                     size="icon"
                     onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                ) : (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                )
            )}

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
