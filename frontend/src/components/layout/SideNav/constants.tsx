import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { SideNavItem } from "./types"

export const SIDENAV_ITEMS: SideNavItem[] = [
    {
        title: "Projets",
        path: "/projets",
        icon: <FontAwesomeIcon icon={Icons.briefcase}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Vue d'ensemble", path:"/sub1", icon: <FontAwesomeIcon icon={Icons.tableCells}/>},
            { title: "Idéation", path:"/sub", icon: <FontAwesomeIcon icon={Icons.lightbulb}/>},
            { title: "Conception", path:"/sub2", icon: <FontAwesomeIcon icon={Icons.penRuler}/>},
            { title: "Pilotage", path:"/sub3", icon: <FontAwesomeIcon icon={Icons.compass}/>},
            { title: "Reporting", path:"/sub4", icon: <FontAwesomeIcon icon={Icons.users}/>},
        ],
    },
    {
        title: "Clients",
        path: "/clients",
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
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
    },
    {
        title: "Finances",
        path: "/finance",
        icon: <FontAwesomeIcon icon={Icons.coins}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Vue d'ensemble", path:"/sub1", icon: <FontAwesomeIcon icon={Icons.tableCells}/>},
            { title: "Idéation", path:"/sub1", icon: <FontAwesomeIcon icon={Icons.lightbulb}/>},
            { title: "Conception", path:"/sub2", icon: <FontAwesomeIcon icon={Icons.penRuler}/>},
            { title: "Pilotage", path:"/sub3", icon: <FontAwesomeIcon icon={Icons.compass}/>},
            { title: "Reporting", path:"/sub4", icon: <FontAwesomeIcon icon={Icons.users}/>},
        ],
    },
    {
        title: "Planning",
        path: "/planning",
        icon: <FontAwesomeIcon icon={Icons.calendar}/>,
    },
]