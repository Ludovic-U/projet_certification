"use client";

import React from "react";
import { Button } from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faGear } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@/components/ui/Tooltip";

interface ProjectItem {
    id: string | number;
    title: string;
    type: string;
    step: string,
    contributors: number;
    hasSettings?: boolean;
}

interface ProjectProps {
    data: ProjectItem[];
    role: "superadmin" |
}

export const List: React.FC<ProjectProps> = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-y-5 select-none">
                <thead className="text-xs capitalize text-center font-noto text-greydarker">
                    <tr>
                        <th className=" w-10 font-bold py-1 px-2">ID</th>
                        <th className="w-40 font-bold py-1">Titre</th>
                        <th className="w-20 font-bold py-1">Type</th>
                        <th className="w-40 font-bold py-1">étape actuelle</th>
                        <th className="w-24 font-bold py-1">Contributeurs</th>
                        <th className="w-32 font-bold py-1">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="bg-white shadow-400 hover:bg-lighthover cursor-pointer">
                            <td className=" w-10 text-center py-5 px-2 text-grey font-bold rounded-l-md">
                                {item.id}
                            </td>

                            <td className="max-w-40 py-5 px-2 font-noto">
                                <span className="block truncate text-left text-lg">{item.title}</span>
                            </td>

                            <td className="w-20 py-5 text-center text-sm font-bold uppercase">
                                <span className="inline-block border px-4 py-1 rounded-full whitespace-nowrap">
                                    {item.type}
                                </span>
                            </td>

                            <td className="w-40 py-5 px-2 text-center text-primary font-bold uppercase">
                                {item.step}
                            </td>
                            
                            
                            <td className="w-24 py-5 text-center text-base font-bold">
                                <FontAwesomeIcon className="mr-2" icon={faUsers}></FontAwesomeIcon>
                                {item.contributors}
                            </td>
                            <td className="w-32 py-5 text-center rounded-r-md">
                                <Button size="sm" variant="iconPrimary">
                                    <FontAwesomeIcon  icon={faGear}></FontAwesomeIcon>
                                    Paramètres
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};