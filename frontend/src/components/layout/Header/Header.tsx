"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { cn } from "@/utils/utils";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { Button, Tooltip } from "@/components/ui";

const Header = () => {
    const { signOut } = useUser()

    return (
        <div
         className={cn(
            "sticky inset-x-0 top-0 z-30 w-full transition-all bg-primary"
         )}
        >
            <div className="flex h-[47px] items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    {/* Affiché uniquement sur mobile md:hidden */}
                    <Link
                     href="/"
                     className="flex flex-row space-x-2 items-center justify-center md:hidden"
                    >
                        <span className="h-7 w-7 bg-light rounded-full"/>
                        <span className="font-medium font-oswald text-light text-xl flex">Figures de Skills</span>
                    </Link>
                </div>
                {/* Contenu visible uniquement sur écran taille md (en dessous = mobile) */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="h-8 w-8 rounded-full bg-light flex items-center justify-center text-center">
                        <span className="font-semibold text-sm">HQ</span>
                    </div>
                    <Tooltip content="Se déconnecter" position="leftBottom">
                        <Button
                         type="button"
                         onClick={signOut}
                         variant="primary" size="icon">
                            <FontAwesomeIcon className="text-light" icon={Icons.logout}/>
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default Header;