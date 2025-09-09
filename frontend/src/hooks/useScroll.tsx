// Hook personnalisé qui détexte si l'user a defilé au-delà du seuil vertical donné (threshold)
// param : threshold - valeur en pixels définissant le point de déclenchement
// returns : boolean - 'true' si la position de scroll verticale dépasse le seuil, sinon 'false'

import { useCallback, useEffect, useState } from "react";

export default function useScroll(threshold: number) {
    // Etat qui indique si la page est scrollée au delà du seuil
    const [scrolled, setScrolled] = useState(false);

    // Fonction qui met à jour l'état en fonction de la position du scroll
    const onScroll = useCallback(() => {
        setScrolled(window.scrollY > threshold);
    }, [threshold]);

    // Ajoute un écouteur d'évènement au scroll, et le nettoie au démontage
    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [onScroll]);

    // Appel initial pour définir l'état correct dès le montage du composant
    useEffect(() => {
        onScroll();
    }, [onScroll]);

    // Retourne un boolean indiquant si le seuil est dépassé ou non
    return scrolled;
} 