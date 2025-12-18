import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { SideNavItem } from "./types"
import { useParams } from "next/navigation";


export const SIDENAV_ITEMS: SideNavItem[] = [
    {
        title: "Building", // pages de test pour dev
        path: "/front",
        icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>,
        roles: ["super_admin"], // <-- visible uniquement pour super_admin
        subMenu: true,
        subMenuItems: [
            { title: "Page Test", path:"/building", icon: <FontAwesomeIcon icon={Icons.users}/>},
            { title: "Tree", path:"/building/build-tree", icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>},
            { title: "Components", path:"/building/components", icon: <FontAwesomeIcon icon={Icons.users}/>},
        ],
    },
    {
        title: "App Config", // pages de test pour dev
        path: "/front",
        icon: <FontAwesomeIcon icon={Icons.penRuler}/>,
        roles: ["super_admin"], // <-- visible uniquement pour super_admin
        subMenu: true,
        subMenuItems: [
            { title: "Questions", path:"/admin/questions", roles: ["super_admin"], icon: <FontAwesomeIcon icon={Icons.question}/>},
            { title: "Financeurs", path:"/admin/financeurs", roles: ["super_admin"], icon: <FontAwesomeIcon icon={Icons.coins}/>},
            { title: "Config Textes", path:"/admin/config", roles: ["super_admin"], icon: <FontAwesomeIcon icon={Icons.penRuler}/>},
        ],
    },
    {
        title: "Clients",
        path: "/clients",
        roles: ["super_admin"], 
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },    
    // {
    //     title: "Configuration des Questions",
    //     path: "/questions",
    //     roles: ["super_admin"],
    //     icon: <FontAwesomeIcon icon={Icons.question}/>
    // },
    {
        title: "Liste des Projets",
        path: `/projets`, //TODO: ajout param clientId
        requiredParams: ["clientId"], 
        icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>
    },  
    { 
        title: "Projet Lambda",
        path: "/modif",
        icon: <FontAwesomeIcon icon={Icons.briefcase}/>,
        requiredParams: ["clientId", "projectId"], // <-- n'afficher que si clientId et projectId sont dans l'URL
        subMenu: true,
        subMenuItems: [
            { title: "Vue d'ensemble", path:"/vue_ensemble", requiredParams: ["clientId", "projectId"], icon: <FontAwesomeIcon icon={Icons.tableCells}/>},
            { title: "Ideation", path:"/ideation", requiredParams: ["clientId", "projectId"], icon: <FontAwesomeIcon icon={Icons.lightbulb}/>},
            { title: "Conception", path:"/conception", requiredParams: ["clientId", "projectId"], icon: <FontAwesomeIcon icon={Icons.penRuler}/>},
            { title: "Pilotage", path:"/pilotage", requiredParams: ["clientId", "projectId"], icon: <FontAwesomeIcon icon={Icons.compass}/>},
            { title: "Evaluation", path:"/evaluation", requiredParams: ["clientId", "projectId"], icon: <FontAwesomeIcon icon={Icons.chartBar}/>},
            { title: "Reporting", path:"/reporting", requiredParams: ["clientId", "projectId"], icon: <FontAwesomeIcon icon={Icons.projectDiagram}/>},
        ],
    },    
    {
        title: "Contributeurs",
        path: "/users",
        requiredParams: ["clientId"],
        icon: <FontAwesomeIcon icon={Icons.userTie}/>
    },
    {
        title: "Paramètres projet",
        path: "/parametres",
        requiredParams: ["clientId", "projectId"],
        icon: <FontAwesomeIcon icon={Icons.gear}/>
    },
    {
        title: "Paramètres client",
        path: "/parametres-client",
        roles: ["super_admin", "admin_client"],
        requiredParams: ["clientId"],
        icon: <FontAwesomeIcon icon={Icons.gear}/>
    },
    {
        title: "Déconnexion",
        path: "#",
        action: "signOut",
        icon: <FontAwesomeIcon icon={Icons.logout}/>
    },
]
