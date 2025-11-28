import React from "react";

// Contenu dans un Item de la Sidebar
export type SideNavItem = {
    title: string; // Titre
    path: string; // Le chemin de navigation associé (URL path)
    icon?: React.ReactNode; // Icône
    roles?: string[]; // Optionnel : liste des rôles autorisés à voir cet item
    requiredParams?: string[]; // Optionnel : liste des params requis dans l'URL pour afficher cet item
    subMenu?: boolean; // Optionnel : indique si cet item comprend un submenu
    subMenuItems?: SideNavItem[]; // Optionnel : tableau d'items enfants
    button?: React.ReactNode; // Optionnel : bouton personnalisé
    action?: string; // Optionnel : action à exécuter au lieu de naviguer (ex: "signOut")
};

// Indique si la sidebar est réduite ou étendue
export type SideNavProps = {
    isCollapsed: boolean;
    // Fonction de mise à jour de l'état de collapsed, permet de changer l'état depuis le composant enfant.
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export type MenuItemWithSubMenuProps = {
    // L'élément de menu à afficher. Contient toutes les informations nécessaires (title, path, etc)
    item: SideNavItem;
    // Fonction permettant d'ouvrir/fermer le sous-menu de l'item
    toggleOpen: () => void;
}