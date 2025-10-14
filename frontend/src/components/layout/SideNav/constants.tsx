import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { SideNavItem } from "./types"

export const SIDENAV_ITEMS: SideNavItem[] = [
    {
        title: "Building",
        path: "/front",
        icon: <FontAwesomeIcon icon={Icons.penRuler}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Page Test", path:"/building", icon: <FontAwesomeIcon icon={Icons.users}/>},
            { title: "Tree", path:"/building/build-tree", icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>},
            { title: "Components", path:"/building/components", icon: <FontAwesomeIcon icon={Icons.users}/>},
            { title: "Tree Hierarchy", path:"/building/tree"}
        ],
    },
    {
        title: "Projet Lambda",
        path: "/modif",
        icon: <FontAwesomeIcon icon={Icons.briefcase}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Vue d'ensemble", path:"/vue_ensemble", icon: <FontAwesomeIcon icon={Icons.tableCells}/>},
            { title: "Ideation", path:"/ideation", icon: <FontAwesomeIcon icon={Icons.lightbulb}/>},
            { title: "Conception", path:"/conception", icon: <FontAwesomeIcon icon={Icons.penRuler}/>},
            { title: "Pilotage", path:"/pilotage", icon: <FontAwesomeIcon icon={Icons.compass}/>},
            { title: "Reporting", path:"/reporting", icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>},
        ],
    },
    {
        title: "Projets",
        path: "/projets",
        icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>
    },
    {
        title: "Clients",
        path: "/clients",
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },
    {
        title: "Contributeurs",
        path: "/users",
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },
    {
        title: "Questions",
        path: "/questions",
        icon: <FontAwesomeIcon icon={Icons.question}/>
    },
    {
        title: "Paramètres",
        path: "/parametres",
        icon: <FontAwesomeIcon icon={Icons.gear}/>
    },
]
