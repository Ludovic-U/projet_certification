"use client";
// Indique que ce fichier doit être exécuté côté client.

import { useRef, useEffect } from "react";

// Hook personnalisé pour récupérer les dimentions d'un élément via ref
export const useDimensions = (ref: any) => {
    // useRef permet de stocker une valeur qui persiste entre les re-renders sans déclancher de re-render
    // Ici, on initialise un objet contenant width et height à 0.
    const dimensions = useRef({ width: 0, height: 0});

    // useEffect sera exécuté après le rendu du composant
    useEffect(() => {
        // Ici, on vérifie si la ref pointe vers un élément réel (ref.current existe)
        if (ref.current) {
            // offsetWidth / offsetHeight : dimensions visibles de l'élément.
            // Ces valeurs sont stockées dans dimensions.current pour les rendre persistantes.
            dimensions.current.width = ref.current.offsetWidth;
            dimensions.current.height = ref.current.offsetHeight;
        }
        // [ref] comme dépendance signifie que l'effet sera rappelé si la ref change
    }, [ref]);

    // On retourne directement dimensions.current
    // Cela donne un objet { width, heigth } que le composant peut utiliser.
    return dimensions.current;
};