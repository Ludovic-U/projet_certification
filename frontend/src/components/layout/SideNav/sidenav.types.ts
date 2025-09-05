import { MouseEventHandler } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface NavItem {
    label: string;
    icon: IconDefinition;
    tooltip: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface SideNavProps {
    isOpen: boolean;
    toggle: () => void;
    navItems?: NavItem[];
};