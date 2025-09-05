import React from "react";

export type SideTestItem = {
    title: string;
    path: string;
    icon?: React.ReactNode;
    subMenu?: boolean;
    subMenuItems?: SideTestItem[];
};