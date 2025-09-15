"use client";

import React from "react";
import { ListProps } from "./list.types"

export const List = <T extends { id: string | number }>({ data, columns }: ListProps<T>) => {
    return (
        <div className="w-full flex flex-col items-center overflow-x-scroll font-noto">
            <table className="w-[90%] table-fixed border-separate border-spacing-y-5 select-none">
                <thead className="text-xs capitalize text-center font-noto text-greydarker">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={`font-bold ${col.className || ""}`}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                        {data.map((item) => (
                            <tr key={item.id} className="bg-white group cursor-pointer shadow-400">
                                {columns.map((col) => (
                                    <td key={col.key} className="bg-white align-middle group-hover:bg-lighthover py-5 text-center">
                                        {col.render ? col.render(item) : (item as any)[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};