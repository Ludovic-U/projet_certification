"use client";

import React from "react";
import { TableProps } from "./table.types"

export const TableResponsive = <T extends { id: string | number; }>({ data, columns, onRowClick }: TableProps<T>) => {
    return (
        <div className="md:hidden flex gap-8 flex-wrap justify-center">
            {data.map((item) => (
                <div key={item.id}className="p-4 rounded-lg w-fit max-w-[350px] bg-white shadow-400 flex flex-col gap-2 items-center">
                    {columns.map((col) => (
                        <div
                         key={col.key}
                         onClick={() => onRowClick?.(item)}>
                            {col.render ? col.render(item) : (item as any)[col.key]}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};