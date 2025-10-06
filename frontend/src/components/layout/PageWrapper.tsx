// Container de mise en forme pour le contenu des pages

import { ReactNode } from "react";

export default function PageWrapper({ children }: {children: ReactNode}) {
    return (
        <div className="flex-grow flex flex-col p-10 space-y-2 bg-light">
            {children}
        </div>
    );
}