"use client";

import React from "react";
import { Button } from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faGear } from "@fortawesome/free-solid-svg-icons";

export interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface ListProps<T> {
    data: T[];
    columns: Column<T>[];
}

export const List = <T extends { id: string | number }>({ data, columns }: ListProps<T>) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-y-5 select-none">
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
                            <tr key={item.id} className="bg-white group cursor-pointer shadow-400 h-[70px]">
                                {columns.map((col) => (
                                    <td key={col.key} className="bg-white group-hover:bg-lighthover text-center">
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