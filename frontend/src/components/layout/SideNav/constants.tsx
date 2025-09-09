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
            { title: "Idéation", path:"/sub1", icon: <FontAwesomeIcon icon={Icons.briefcase}/>},
            { title: "Conception", path:"/sub2", icon: <FontAwesomeIcon icon={Icons.gear}/>},
            { title: "Pilotage", path:"/sub3", icon: <FontAwesomeIcon icon={Icons.gear}/>},
            { title: "Reporting", path:"/sub4", icon: <FontAwesomeIcon icon={Icons.gear}/>},
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
            { title: "Sub1", path:"/sub1", icon: <FontAwesomeIcon icon={Icons.gear}/>},
            { title: "Sub2", path:"/sub2", icon: <FontAwesomeIcon icon={Icons.gear}/>},
            { title: "Sub3", path:"/sub3", icon: <FontAwesomeIcon icon={Icons.gear}/>},
        ],
    },
]