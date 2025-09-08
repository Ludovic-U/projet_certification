import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { SideTestItem } from "./types"

export const SIDETEST_ITEMS: SideTestItem[] = [
    {
        title: "Clients",
        path: "/clients",
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },
    {
        title: "P rojects",
        path: "/projects",
        icon: <FontAwesomeIcon icon={Icons.briefcase}/>,
        subMenu: true,
        subMenuItems: [
            { title: "Sub1", path:"/"},
            { title: "Sub2", path:"/"},
            { title: "Sub3", path:"/"},
        ],
    },
    {
        title: "Collaborateurs",
        path: "/",
        icon: <FontAwesomeIcon icon={Icons.users}/>
    },
    {
        title: "Questions",
        path: "/",
        icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>
    },
]