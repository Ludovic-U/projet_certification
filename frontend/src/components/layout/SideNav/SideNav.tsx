"use client";

import React, { forwardRef } from "react";

import { FontAwesomeIcon, Icons } from "@/lib/icons";

import { SideNavProps } from "./sidenav.types";
import { Tooltip, Button } from "@/components/ui";

export const SideNav = forwardRef<HTMLElement, SideNavProps> (
    ({ isOpen, toggle, navItems = [] }, ref) => {

    return (
        <aside
         ref={ref}
         className={`
            fixed top-0 left-0 h-screen z-20 flex flex-col bg-dark text-light pt-8
            transition-all duration-300 shrink-0
            ${isOpen ? "w-[240px]" : "w-[90px]"}
         `}
        >
        <Button
         variant="iconRound"
         className={`absolute top-25
         ${isOpen ? "left-56" : "left-19"}`}
         size="smRound"
         onClick={toggle}
         icon={
            <FontAwesomeIcon
             icon={Icons.chevronRight}
             size="sm"
             className={`transition-transform duration-300
             ${isOpen ? "rotate-180" : ""}`}
            />
         }/>

            <p className="font-bold text-center justify-center w-full">
                {isOpen ? "Figure de Skills" : "F2S"}
            </p>

            <ul className="mt-4 space-y-2 flex flex-col items-center">
                <li className="">
                    <Tooltip content="Voir tous les clients" position="right">
                        <Button
                            variant="nav"
                            size={isOpen ? "sm" : "xs"}
                            icon={
                                <FontAwesomeIcon
                                    icon={Icons.userTie}
                                    className="hover:text-lighthover"
                                    size="lg"
                                />
                            }
                        >
                            {isOpen && "Clients"}
                        </Button>
                    </Tooltip>                    
                </li>
                <li className="">
                    <Tooltip content="Voir tous les projets" position="right">
                        <Button
                            variant="nav"
                            size={isOpen ? "sm" : "xs"}
                            icon={
                                <FontAwesomeIcon
                                    icon={Icons.briefcase}
                                    className="hover:text-lighthover"
                                    size="lg"
                                />
                            }
                        >
                            {isOpen && "Projets"}
                        </Button>
                    </Tooltip>
                </li>
                <li className="">
                    <Tooltip content="Voir tous les collaborateurs" position="right">
                        <Button
                            variant="nav"
                            size={isOpen ? "sm" : "xs"}
                            icon={
                                <FontAwesomeIcon
                                    icon={Icons.users}
                                    className="hover:text-lighthover"
                                    size="lg"
                                />
                            }
                        >
                            {isOpen && "Collaborateurs"}
                        </Button>
                    </Tooltip>
                </li>
                <li className="">
                    <Tooltip content="Voir toutes les questions" position="right">
                        <Button
                            variant="nav"
                            size={isOpen ? "sm" : "xs"}
                            icon={
                                <FontAwesomeIcon
                                    icon={Icons.projectDiagram}
                                    className="hover:text-lighthover"
                                    size="lg"
                                />
                            }
                        >
                            {isOpen && "Questions"}
                        </Button>
                    </Tooltip>
                </li>
            </ul>
        </aside>
    )
})

SideNav.displayName = "SideNav";