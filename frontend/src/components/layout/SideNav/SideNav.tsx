"use client";

import React, { useState } from "react";

import Link from "next/link"; // Composant de navigation côté client
import { useParams, usePathname } from "next/navigation"; // Hook pour récupérer le chemin de l'url active 
import { SIDENAV_ITEMS } from "./constants"; // Liste des items du menu (icônes, titres, liens...)
import { SideNavItem, SideNavProps } from "./types"; // Type TypeScript décrivant la forme d'un item de menu
import { FontAwesomeIcon, Icons } from "@/lib/icons"; // Icones utilisés dans la navbar
import { Button, Tooltip } from "@/components/ui"; // Composant Tooltip pour affichage au survol
import { useLocalStorage } from "@/context/LocalStorageContext";
import { useUser } from "@/context/UserContext";


// Déclare l'état de la sidenav (ouverte ou fermée).
const SideNav = ({ isCollapsed, setIsCollapsed }: SideNavProps) => {
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    // Etat pour gérer quel sous-menu est ouvert (pour n'en avoir qu'un seul à la fois)
    const [openSubMenuIndex, setOpenSubMenuIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    const handleSubMenuToggle = (index: number) => {
        setOpenSubMenuIndex(openSubMenuIndex === index ? null : index);
    }
    
    const params = useParams();
    const { data } = useLocalStorage();
    const { user } = useUser();

    // Déterminer le lien de la page d'accueil selon le rôle
    const homeLink = user?.roles?.some((role: any) => role === "super_admin") 
        ? "/clients"
        : `/${user?.clientId}/projets` ;

    // Attendre que le composant soit monté côté client
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        // Composant principal :
        // Fixée à gauche, prend toute la hauteur de l'écran et masquée sur mobile.
        <div className={`fixed hidden h-screen ${isCollapsed ? 'md:w-16' : 'md:w-63'} flex-1 bg-dark text-light font-noto md:flex z-50 transistion-all duration-300`}>
            <div className="relative flex w-full flex-col h-full">

                {/* Logo + Titre */}
                <Link
                 href={homeLink}
                 className={`flex mt-2 h-12 w-full flex-row items-center flex-shrink-0
                            ${isCollapsed ? "justify-center" : "md:justify-start md:px-6 spase-x-3"}`}
                 >
                    {/* cercle coloré représentant le logo */}
                    <span className="h-7 w-7 bg-primary rounded-full flex-shrink-0"/>

                    {/* Titre affiché uniquement lorsque la sidenav est ouverte (isCollapsed à false) */}
                    {!isCollapsed && (
                        <span className={`font-bold font-oswald text-xl ml-2 whitespace-nowrap overflow-hidden transition-all duration-300
                                        ${isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}`}>
                            Figures de Skills
                        </span>
                    )}
                
                </Link>

                {/* Boucle sur SIDENAV_ITEMS et crée un MenuItem pour chaque item. */}
                <div className={`flex flex-col space-y-2 md:px-6 mt-8 overflow-y-auto flex-1 pb-20 ${isCollapsed ? "items-center px-0" : ""}`}>
                    {mounted && SIDENAV_ITEMS
                    
                    .filter(item => !item.requiredParams || item.requiredParams?.every(param => param in params))
                    .filter(item => {
                        // Si l'item a des rôles requis, vérifier que l'utilisateur a au moins un de ces rôles
                        if (item.roles && item.roles.length > 0) {
                            return user?.roles?.some((userRole: string) => item.roles?.includes(userRole));
                        }
                        // Si pas de rôles requis, afficher l'item pour tout le monde
                        return true;
                    })
                    .map((item, idx) => {
                        // remplace le titre du projet 
                        let title = item.title;
                        if (item.title === "Projet Lambda") {
                            title = "Projet " + data.projectName 
                        }

                        // concatene les requiredParams à path si besoin
                        let path = item.path;
                        if (item.requiredParams) {
                            const paramsPath = item.requiredParams.map(param => params[param as keyof typeof params]).join("/");
                            // Si item.path commence par "/", retire-le pour éviter "//"
                            const cleanPath = typeof path === "string" && path.startsWith("/") ? path : `/${path}`;
                            path = `/${paramsPath}${cleanPath}`;
                        }

                        // Ajoute la classe text-amber-400 si l'item a le rôle super_admin
                        const superAdminClass = item.roles?.length === 1 && item.roles[0] === "super_admin" ? "text-amber-400" : "";
                        const logoutClass = item.action === "signOut"  ? "text-red-500" : "";

                        return (
                            <div key={idx} className={`${superAdminClass} ${logoutClass}`}>
                                <MenuItem
                                 item={{ ...item, title, path }}
                                 isCollapsed={isCollapsed}
                                 isSubMenuOpen={openSubMenuIndex === idx}
                                 onSubMenuToggle={() => handleSubMenuToggle(idx)}
                                />
                                {item.showSeparatorAfter && (
                                    <div className={`border-b border-lighthover opacity-30 ${isCollapsed ? 'mx-2' : 'mx-0'} my-3`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bouton pour ouvrir ou fermer la sidenav avec toggleCollapse */}
                <button
                 onClick={toggleCollapse}
                 className="absolute top-14 -right-4 cursor-pointer h-8 w-8 text-dark border border-dark bg-light rounded-full hover:bg-lighthover hover:text-darkhover transition-all">
                    <FontAwesomeIcon icon={isCollapsed ? Icons.chevronRight : Icons.chevronLeft}
                     className="text-md text-dark"/>
                </button>
            </div>
        </div>
    );
};

export default SideNav;

// Composant MenuItem
// Gère l'affichage d'un item du menu
// Récupère le chemin actuel (pathname) pour mettre en surbrillance l'item actif
const MenuItem = (
    {
        item,
        isCollapsed,
        isSubMenuOpen,
        onSubMenuToggle
    }: {
        item: SideNavItem,
        isCollapsed: boolean,
        isSubMenuOpen: boolean,
        onSubMenuToggle: () => void;
    }) => {
        const pathname = usePathname();        
        const params = useParams();
        const { signOut } = useUser();

        const handleClick = (e: React.MouseEvent) => {
            if (item.action === "signOut") {
                e.preventDefault();
                signOut();
            }
        };

        const parentActive = pathname === item.path;
        const childActive = item.subMenuItems?.some(sub => {
            let subPath = sub.path;
            if (sub.requiredParams) {
                const paramsPath = sub.requiredParams.map(param => params[param as keyof typeof params]).join("/");
                const cleanPath = typeof subPath === "string" && subPath.startsWith("/") ? subPath : `/${subPath}`;
                subPath = `/${paramsPath}${cleanPath}`;
            }
            return pathname === subPath;
        });

    // SIDENAV FERMEE
    // Chaque item s'affiche uniquement comme icône carré cliquable + Tooltip en hover avec le titre
    // Si le chemin actuel (pathname) correspond, l'icône de l'item actif est mis en surbrillance
    if (isCollapsed) {
        const menuContent = (
            // Contenu graphique de base (icône dans carré centré)
            <div
             className={`cursor-pointer flex items-center justify-center h-10 w-10 rounded-lg transition hover:bg-lighthover hover:text-primary
                    ${parentActive ? "text-primary" : ""}
                    ${childActive && !parentActive ? "text-primary" : ""}`}
            >
                {item.icon}
            </div>
        );

        // Si l'item a un sous-menu, affichage d'un flyoutmenu au hover
        if (item.subMenu) {
            return (
                <div className="relative group">
                    {/* Icône visible en sidebar */}
                    {menuContent}

                    {/* Flyout menu : apparaît à droite au hover */}
                    <div
                     className="absolute left-full top-0 ml-4 hidden group-hover:flex flex-col
                     bg-dark text-lighthover rounded-lg shadow-400 p-3 z-50 min-w-[180px]">

                        {/* Zone Tampon pour laisser le flyoutmenu ouvert le temps de mettre la souris dessus */}
                        <div className="absolute -left-4 top-0 h-full w-4"/>

                        {/* Titre du menu parent */}
                        <span className="font-semibold text-base mb-3 text-light">{item.title}</span>
                        {/* Liste des sous-items */}
                        <div className="flex flex-col space-y-1">
                            {item.subMenuItems?.map((subItem, idx) => {
                                let subPath = subItem.path;
                                if (subItem.requiredParams) {
                                    const paramsPath = subItem.requiredParams.map(param => params[param as keyof typeof params]).join("/");
                                    const cleanPath = typeof subPath === "string" && subPath.startsWith("/") ? subPath : `/${subPath}`;
                                    subPath = `/${paramsPath}${cleanPath}`;
                                }
                                return (
                                    <Link
                                     key={idx}
                                     href={subPath}
                                     className={`flex items-center gap-2 whitespace-nowrap text-sm rounded-lg px-3 py-2
                                                hover:bg-lighthover hover:text-primary
                                     ${pathname === subPath ? "font-semibold text-primary" : ""}`}>
                                        {subItem.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        // Item sans sous-menu, simple tooltip affichant le titre au survol
        return (
            <Tooltip content={item.title} position="rightMenu">
                <Link href={item.path} onClick={handleClick}>
                    {menuContent}
                </Link>
            </Tooltip>
        );
    }

    // SIDENAV OUVERTE
    return (
        <div className="">
            {/* Si l'item a un submenu */}
            {item.subMenu ? (
                <>
                {/* Bouton principal : icône + titre + chevron */}
                {/* Mis en surbrillance si le pathname correspond */}
                    <button
                     onClick={onSubMenuToggle}
                     className={`
                        cursor-pointer flex w-full flex-row items-center justify-between transition p-2 rounded-lg
                        hover:bg-lighthover hover:text-primary
                        ${parentActive ? "text-primary" : ""}
                        ${childActive && !parentActive ? "text-primary200" : ""}`}
                    >
                        <div className="flex flex-row space-x-4 items-center">
                            {item.icon}
                            <span className="font-base flex">{item.title}</span>
                        </div>

                        {/* chevron pour ouvrir/fermer le submenu*/}
                        <div className={`${isSubMenuOpen ? 'rotate-180' : ""} flex`}>
                            <FontAwesomeIcon className="text-sm" icon={Icons.chevronDown}></FontAwesomeIcon>
                        </div>
                    </button>

                    {/* Si le sous-menu est ouvert, affichage de la liste des liens enfants */}
                    {/* Animation de transition avec le conteneur qui reste toujours monté et jeu sur opacity et taille en fonction de isSubMenuOpen true ou false */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out
                                        ${isSubMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            {/* Liste des liens enfants (submenu), l'item actif est surlignée si son path correspond */}
                            <div className="my-2 ml-2 flex flex-col space-y-5 text-lighthover w-fit p-2">
                                {item.subMenuItems?.map((subItem, idx) => {
                                    let path = subItem.path;
                                    if (subItem.requiredParams) {
                                    const paramsPath = subItem.requiredParams.map(param => params[param as keyof typeof params]).join("/");
                                    // Si subItem.path commence par "/", retire-le pour éviter "//"
                                    const cleanPath = typeof path === "string" && path.startsWith("/") ? path : `/${path}`;
                                    path = `/${paramsPath}${cleanPath}`;
                                    console.log(path);
                                    }
                                    return (
                                        <Link
                                        key={idx}
                                        href={path}
                                        className={`flex gap-3 items-center p-2 rounded-lg transition
                                                    ${pathname === path ? 'font-semibold text-primary' : 'hover:bg-lighthover hover:text-primary'}`}
                                        >
                                            <span className="flex gap-3 items-center">{subItem.icon}{subItem.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                </>
            ) : (
                // Item sans sous-menu
                // Icône + titre cliquables pour rediriger et si pathname correspond à l'item, alors mis en surbrillance.
                <Link
                 href={item.path}
                 onClick={handleClick}
                 className={`flex flex-row space-x-4 items-center p-2 rounded-lg hover:bg-lighthover hover:text-primary
                    ${parentActive ? 'text-primary font-semibold cursor-default hover:bg-transparent' : ''}`}
                >
                    {item.icon}
                    <span className="flex font-base">{item.title}</span>
                </Link>
            )}
        </div>
    );
};