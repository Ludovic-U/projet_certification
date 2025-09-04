import React from "react";

export default function Header() {
    return (
    <header className="h-[60px] bg-primary sticky top-0 flex items-center justify-end z-10">
        <div className="flex pr-10">
            <p className="text-light font-medium text-2xl">Bonjour, Super admin</p>
        </div>
    </header>
    )
}