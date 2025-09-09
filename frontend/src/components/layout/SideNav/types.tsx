import React from "react";

export type SideNavItem = {
    title: string;
    path: string;
    icon?: React.ReactNode;
    subMenu?: boolean;
    subMenuItems?: SideNavItem[];
};

export type SideNavProps = {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export type MenuItemWithSubMenuProps = {
    item: SideNavItem;
    toggleOpen: () => void;
}