"use client";

import React from "react";
import { TableProps } from "./table.types"

export const Table = <T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    onEditClick,
}: TableProps<T>) => {

    return (
        <div className="hidden md:block font-noto">
            <div className="flex flex-col items-center overflow-x-scroll">
                <table className="w-full px-4 table-fixed border-separate border-spacing-y-1 select-none">
                    <thead className="text-xs capitalize text-center font-noto text-greydarker">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className={`font-bold py-1 ${col.className || ""}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                            {data.map((item, itemIndex) => (
                                <tr key={item.id ?? `item-${itemIndex}`} className="bg-white group cursor-pointer shadow-400">
                                    {columns.map((col, colIndex) => (
                                        <td
                                         key={col.key ?? `col-${colIndex}`}
                                         onClick={() => onRowClick?.(item)}
                                         className="bg-white align-middle group-hover:bg-lighthover py-2 text-center text-sm">
                                            {col.render ? col.render(item, onEditClick) : (item as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};