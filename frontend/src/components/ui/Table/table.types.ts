import React from "react"

export interface Column<T> {
    key: string;
    label: string;
    render?: (item: T, onEditClick?: (item: T, event: React.MouseEvent) => void) => React.ReactNode;
    className?: string;
}

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: any) => void;
    onEditClick?: (item: T, event: React.MouseEvent) => void;
}