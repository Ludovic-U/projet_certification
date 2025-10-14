import React from "react"

export interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: any) => void;
}