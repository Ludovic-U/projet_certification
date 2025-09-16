import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { SideNavItem } from "./types"

export const SIDENAV_ITEMS: SideNavItem[] = [
    {
        title: "Building",
        path: "/front",
        icon: <FontAwesomeIcon icon={Icons.penRuler}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Page", path:"/building", icon: <FontAwesomeIcon icon={Icons.users}/>},
            { title: "Components", path:"/building/components", icon: <FontAwesomeIcon icon={Icons.users}/>},
        ],
    },
    {
        title: "Clients",
        path: "/clients",
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },
    {
        title: "Projets",
        path: "/projets",
        icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>
    },
    {
        title: "Questions",
        path: "/questions",
        icon: <FontAwesomeIcon icon={Icons.question}/>
    },
    {
        title: "Listes",
        path: "/finance",
        icon: <FontAwesomeIcon icon={Icons.list}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Clients", path:"/clients", icon: <FontAwesomeIcon icon={Icons.users}/>},
            { title: "Projets", path:"/projets", icon: <FontAwesomeIcon icon={Icons.briefcase}/>},
            { title: "Questions", path:"/questions", icon: <FontAwesomeIcon icon={Icons.question}/>},
        ],
    },
]