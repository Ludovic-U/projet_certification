"use client";

import React from "react";
import { TableProps } from "./table.types"

export const TableResponsive = <T extends { id: string | number; }>({
    data,
    columns,
    onRowClick,
    onEditClick,
}: TableProps<T>) => {
    return (
        <div className="md:hidden mt-4 flex gap-8 flex-wrap justify-center">
            {data.map((item, itemIndex) => (
                <div
                 key={item.id ?? `item-${itemIndex}`}
                 className="p-4 rounded-lg min-w-75 max-w-75 bg-white shadow-400 flex flex-col gap-2 items-center"
                >
                    {columns.map((col, colIndex) => (
                        <div
                         key={col.key ?? `item-${colIndex}`}
                         className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-70 text-center"
                         onClick={() => onRowClick?.(item)}>
                            {col.render ? col.render(item, onEditClick) : (item as any)[col.key]}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};