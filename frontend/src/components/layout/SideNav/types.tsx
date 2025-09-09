import React from "react";

// Contenu dans un Item de la Sidebar
export type SideNavItem = {
    title: string; // Titre
    path: string; // Le chemin de navigation associé (URL path)
    icon?: React.ReactNode; // Icône
    subMenu?: boolean; // Optionnel : indique si cet item comprend un submenu
    subMenuItems?: SideNavItem[]; // Optionnel : tableau d'items enfants
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