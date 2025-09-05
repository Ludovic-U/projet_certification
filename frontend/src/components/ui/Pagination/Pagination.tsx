"use client";

import * as React from "react";
import { PaginationProps } from "./pagination.types";
import { Button } from "../Button";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

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
             variant="pagination"
             size="pagination"
             disabled={currentPage === 1}
             onClick={() => onPageChange(currentPage - 1)}
            >
                <FontAwesomeIcon icon={Icons.chevronLeft}/>
            </Button>

            {pages.map((page) => (
                <Button
                 key={page}
                 variant={page === currentPage ? "paginationActive" : "pagination"}
                 size="pagination"
                 onClick={() => onPageChange(page)}>
                    {page}
                </Button>
            ))}

            <Button
             variant="pagination"
             size="pagination"
             disabled={currentPage === totalPages}
             onClick={() => onPageChange(currentPage + 1)}
            >
                <FontAwesomeIcon icon={Icons.chevronRight}/>
            </Button>

        </div>
    )
}