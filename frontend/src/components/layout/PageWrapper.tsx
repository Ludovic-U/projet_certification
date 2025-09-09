import { ReactNode } from "react";

// PageWrapper est un composant "Layout" léger
// Il sert à envelopper le contenu principal de chaque page
// Pour gérer le padding, l'espacement vertical et l'arrière plan du contenu.
export default function PageWrapper({ children }: {children: ReactNode}) {
    return (
        <div className="flex flex-col pt-2 px-4 space-y-2 bg-light flex-grow pb-4">
            {children}
        </div>
    );
}