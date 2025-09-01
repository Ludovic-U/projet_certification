"use client";

import React, { ReactNode } from "react";
import { Button } from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faGear } from "@fortawesome/free-solid-svg-icons";

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
}

export const ProjectList: React.FC<ProjectProps> = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border overflow-hidden text-center">
                <thead className="bg-pink-500">
                    <tr>
                        <th className="capitalize">ID</th>
                        <th className="capitalize">Titre</th>
                        <th className="capitalize">Type</th>
                        <th className="capitalize">étape actuelle</th>
                        <th className="capitalize">Contributeurs</th>
                        <th className="capitalize">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="bg-purple-400">
                            <td>{item.id}</td>
                            <td>{item.title}</td>
                            <td>{item.type}</td>
                            <td>{item.step}</td>
                            <td className="flex gap-2 items-center justify-center">
                                <FontAwesomeIcon icon={faUsers}></FontAwesomeIcon>
                                {item.contributors}
                            </td>
                            <td>
                                {item.hasSettings && (
                                    <Button size="sm">
                                        <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
                                        Paramètres
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
