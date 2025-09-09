import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { SideNavItem } from "./types"

export const SIDENAV_ITEMS: SideNavItem[] = [
    {
        title: "Clients",
        path: "/clients",
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },
    {
        title: "Projects",
        path: "/projects",
        icon: <FontAwesomeIcon icon={Icons.briefcase}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Sub1", path:"/projects/sub1"},
            { title: "Sub2", path:"/sub2"},
            { title: "Sub3", path:"/"},
        ],
    },
    {
        title: "Contributeurs",
        path: "/contributeurs",
        icon: <FontAwesomeIcon icon={Icons.users}/>
    },
    {
        title: "Questions",
        path: "/questions",
        icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Sub1", path:"/sub1"},
            { title: "Sub2", path:"/sub2"},
            { title: "Sub3", path:"/sub3"},
        ],
    },
]