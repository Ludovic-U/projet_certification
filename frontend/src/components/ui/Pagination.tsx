"use client";

import * as React from "react";
import { Button } from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className,
}) => {
    if (totalPages < 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className={`flex items-center gap-2 ${className || ""}`}>
            <Button
             variant="pagination"
             size="pagination"
             disabled={currentPage === 1}
             onClick={() => onPageChange(currentPage - 1)}
            >
                <FontAwesomeIcon icon={faChevronLeft}/>
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
                <FontAwesomeIcon icon={faChevronRight}/>
            </Button>

        </div>
    )
}