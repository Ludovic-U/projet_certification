import { ReactNode } from "react";

// PageWrapper est un composant "Layout" léger
// Il sert à envelopper le contenu principal de chaque page
// Pour gérer le padding, l'espacement vertical et l'arrière plan du contenu.
export default function PageWrapper({ children }: {children: ReactNode}) {
    return (
        <div className="flex p-10 flex-col space-y-2 bg-light flex-grow">
            {children}
        </div>
    );
}