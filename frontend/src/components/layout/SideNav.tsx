"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faGear } from "@fortawesome/free-solid-svg-icons";

export default function SideNav() {
    const [open, toggleSidebar] = useState(false);

    return (
        <aside
            className={`
            fixed top-0 left-0 h-screen z-20 flex flex-col bg-dark text-light pt-8
            transition-translate duration-100
            ${open ? "w-[240px]" : "w-[90px]"}
            `}
        >
            <Button
                variant="iconRound"
                className={`absolute top-25
                ${open ? "left-56" : "left-19"}`}
                size="smRound"
                onClick={() => toggleSidebar(!open)}
                icon={
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        size="sm"
                        className={`transition-transform duration-300
                    ${open ? "rotate-180" : ""}`}
                    />
                }
            ></Button>

            <p className="font-bold text-center justify-center w-full">
                {open ? "Figure de Skills" : "F2S"}
            </p>

            <ul className="mt-4 space-y-2">
                <li className="flex items-center justify-center gap-2">
                    <Button
                        variant="nav"
                        size={open ? "sm" : "xs"}
                        icon={
                            <FontAwesomeIcon
                                icon={faGear}
                                className="hover:text-lighthover"
                                size="lg"
                            />
                        }
                    >
                        {open && "Projets"}
                    </Button>
                </li>
                <li className="flex items-center justify-center gap-2">
                    <span>X</span>
                    {open && <span>Item 2</span>}
                </li>
                <li className="flex items-center justify-center gap-2">
                    <span>X</span>
                    {open && <span>Item 3</span>}
                </li>
            </ul>
        </aside>
    );
}
