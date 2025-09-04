"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faGear } from "@fortawesome/free-solid-svg-icons";

type SideNavProps = {
    isOpen: boolean;
    toggle: () => void;
};

export default function SideNav({ isOpen, toggle }: SideNavProps) {
    return (
        <aside
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
                        icon={faChevronRight}
                        size="sm"
                        className={`transition-transform duration-300
                    ${isOpen ? "rotate-180" : ""}`}
                    />
                }
            ></Button>

            <p className="font-bold text-center justify-center w-full">
                {isOpen ? "Figure de Skills" : "F2S"}
            </p>

            <ul className="mt-4 space-y-2">
                <li className="flex items-center justify-center gap-2">
                    <Button
                        variant="nav"
                        size={isOpen ? "sm" : "xs"}
                        icon={
                            <FontAwesomeIcon
                                icon={faGear}
                                className="hover:text-lighthover"
                                size="lg"
                            />
                        }
                    >
                        {isOpen && "Projets"}
                    </Button>
                </li>
                <li className="flex items-center justify-center gap-2">
                    <span>X</span>
                    {isOpen && <span>Item 2</span>}
                </li>
                <li className="flex items-center justify-center gap-2">
                    <span>X</span>
                    {isOpen && <span>Item 3</span>}
                </li>
            </ul>
        </aside>
    )
}
