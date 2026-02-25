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


// ------------------------------------------------------------
// Composant principal: SideNav
// ------------------------------------------------------------
// Rôle du composant:
// - Afficher la navigation latérale de l'application.
// - Gérer l'état visuel "réduite" / "ouverte".
// - Filtrer les items selon l'URL courante et le rôle utilisateur.
// - Construire des URLs dynamiques à partir des params de route.
// ------------------------------------------------------------
const SideNav = ({ isCollapsed, setIsCollapsed }: SideNavProps) => {
    // Inverse l'état actuel de la sidebar (ouverte <-> réduite).
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    // Index du sous-menu de niveau 1 actuellement ouvert.
    // null = aucun sous-menu ouvert.
    // Ce choix garantit qu'un seul bloc principal peut être ouvert à la fois.
    const [openSubMenuIndex, setOpenSubMenuIndex] = useState<number | null>(null);

    // Empêche le rendu prématuré de certains éléments côté serveur
    // (ex: dépendants du contexte client / localStorage).
    const [mounted, setMounted] = useState(false);

    // Ouvre / ferme un sous-menu principal en fonction de son index.
    // Si on reclique sur le même index, on le referme.
    const handleSubMenuToggle = (index: number) => {
        setOpenSubMenuIndex(openSubMenuIndex === index ? null : index);
    }
    
    // Paramètres dynamiques de l'URL (ex: clientId, projectId).
    const params = useParams();

    // Données de contexte stockées localement (nom client/projet affichés dans les labels).
    const { data } = useLocalStorage();

    // Données utilisateur connectées (rôles, clientId, etc.).
    const { user } = useUser();

    // Lien de destination du logo:
    // - super_admin => page clients
    // - autre rôle   => liste des projets de son client
    const homeLink = user?.roles?.some((role: any) => role === "super_admin") 
        ? "/clients"
        : `/${user?.clientId}/projets` ;

    // Marque le composant comme monté après le premier rendu client.
    // Utile pour éviter des écarts SSR/CSR sur des données de contexte client.
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
                // Conteneur global de la sidebar:
                // - fixe à gauche
                // - pleine hauteur
                // - visible à partir du breakpoint md
                // - largeur variable selon isCollapsed
        <div className={`fixed hidden h-screen ${isCollapsed ? 'md:w-16' : 'md:w-63'} flex-1 bg-dark text-light font-noto md:flex z-50 transistion-all duration-300`}>
            <div className="relative flex w-full flex-col h-full">

                                {/* Zone logo + nom de l'application. */}
                <Link
                 href={homeLink}
                 className={`flex mt-2 h-12 w-full flex-row items-center flex-shrink-0
                            ${isCollapsed ? "justify-center" : "md:justify-start md:px-6 spase-x-3"}`}
                 >
                                        {/* Repère visuel du logo. */}
                    <span className="h-7 w-7 bg-primary rounded-full flex-shrink-0"/>

                                        {/*
                                            Le texte de marque n'est visible qu'en mode ouvert,
                                            pour conserver un mode réduit compact centré sur les icônes.
                                        */}
                    {!isCollapsed && (
                        <span className={`font-bold font-oswald text-xl ml-2 whitespace-nowrap overflow-hidden transition-all duration-300
                                        ${isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}`}>
                            Figures de Skills
                        </span>
                    )}
                
                </Link>

                {/*
                  Liste des items de navigation.
                  Pipeline de rendu:
                  1) attendre le montage client
                  2) filtrer selon params requis dans l'URL
                  3) filtrer selon rôles utilisateur
                  4) enrichir certains labels dynamiques
                  5) résoudre les paths dynamiques
                  6) rendre chaque item via <MenuItem />
                */}
                <div className={`flex flex-col space-y-2 md:px-6 mt-8 overflow-y-auto flex-1 pb-20 ${isCollapsed ? "items-center px-0" : ""}`}>
                    {mounted && SIDENAV_ITEMS
                    
                    // Garde uniquement les items dont les params requis existent dans l'URL.
                    .filter(item => !item.requiredParams || item.requiredParams?.every(param => param in params))
                    .filter(item => {
                        // Si l'item a des rôles requis, l'utilisateur doit en posséder au moins un.
                        if (item.roles && item.roles.length > 0) {
                            return user?.roles?.some((userRole: string) => item.roles?.includes(userRole));
                        }
                        // Sans contrainte de rôle, l'item est visible pour tous.
                        return true;
                    })
                    .map((item, idx) => {
                        // Libellés dynamiques pilotés par les données du contexte.
                        let title = item.title;
                        if (item.title === "Projet Lambda") {
                            title = "Projet " + data.projectName 
                        }
                        if (item.title === "Liste des Projets") {
                            title = data.clientName + " - Liste des Projets"
                            console.log("title", data.clientName);
                        }

                        // Construit un path contextualisé avec les params dynamiques requis.
                        let path = item.path;
                        if (item.requiredParams) {
                            const paramsPath = item.requiredParams.map(param => params[param as keyof typeof params]).join("/");
                            // Normalise le path pour éviter les doubles slash.
                            const cleanPath = typeof path === "string" && path.startsWith("/") ? path : `/${path}`;
                            path = `/${paramsPath}${cleanPath}`;
                        }

                        // Couleurs dédiées à certains types d'items.
                        const superAdminClass = item.roles?.length === 1 && item.roles[0] === "super_admin" ? "text-amber-400" : "";
                        const logoutClass = item.action === "signOut"  ? "text-red-500" : "";

                        return (
                            // Chaque item est isolé pour permettre styles + séparateur optionnel.
                            <div key={idx} className={`${superAdminClass} ${logoutClass}`}>
                                <MenuItem
                                 item={{ ...item, title, path }}
                                 isCollapsed={isCollapsed}
                                 isSubMenuOpen={openSubMenuIndex === idx}
                                 onSubMenuToggle={() => handleSubMenuToggle(idx)}
                                />
                                {/* Séparateur visuel configurable dans la config d'item. */}
                                {item.showSeparatorAfter && (
                                    <div className={`border-b border-lighthover opacity-30 ${isCollapsed ? 'mx-2' : 'mx-0'} my-3`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bouton flottant de collapse/expand de la sidebar. */}
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

// ------------------------------------------------------------
// Composant MenuItem
// ------------------------------------------------------------
// Rôle du composant:
// - Afficher un item unique de navigation.
// - Gérer ses variantes visuelles selon l'état de la sidebar.
// - Gérer l'ouverture/fermeture des sous-menus de niveau 1 et 2.
// - Mettre en évidence l'item actif selon pathname.
// ------------------------------------------------------------
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
        // URL active pour déterminer les états "actif".
        const pathname = usePathname();        

        // Params dynamiques de route pour construire les liens avec IDs.
        const params = useParams();

        // Action de déconnexion utilisée par l'item "Déconnexion".
        const { signOut } = useUser();

        // Index du sous-menu de niveau 2 actuellement ouvert dans cet item parent.
        // Ici, le scope est local à chaque MenuItem.
        const [openNestedSubMenuIndex, setOpenNestedSubMenuIndex] = useState<number | null>(null);

        // Ouvre/ferme un sous-menu imbriqué (niveau 2).
        const toggleNestedSubMenu = (index: number) => {
            setOpenNestedSubMenuIndex(prev => (prev === index ? null : index));
        };

        // Construit un path final:
        // - retourne tel quel si pas de requiredParams
        // - sinon préfixe avec les segments dynamiques de l'URL courante
        const resolvePath = (path: string, requiredParams?: string[]) => {
            if (!requiredParams) {
                return path;
            }

            // Ex: [clientId, projectId] => "123/456"
            const paramsPath = requiredParams
                .map(param => params[param as keyof typeof params])
                .join("/");

            // Garantit un path commençant par '/'.
            const cleanPath = path.startsWith("/") ? path : `/${path}`;
            return `/${paramsPath}${cleanPath}`;
        };

        const getPathnameOnly = (fullPath: string) => {
            return fullPath.split("?")[0].split("#")[0];
        };

        // Vérifie récursivement si un item (ou un de ses descendants) correspond à la route active.
        // Utilisé pour garder les parents visuellement "actifs" quand un enfant profond est sélectionné.
        const isItemOrChildActive = (navItem: SideNavItem): boolean => {
            const currentPath = resolvePath(navItem.path, navItem.requiredParams);
            if (pathname === getPathnameOnly(currentPath)) {
                return true;
            }

            if (!navItem.subMenuItems || navItem.subMenuItems.length === 0) {
                return false;
            }

            return navItem.subMenuItems.some(child => isItemOrChildActive(child));
        };

        // Intercepte les clics pour gérer les items "action" (ex: signOut)
        // au lieu d'une navigation classique.
        const handleClick = (e: React.MouseEvent) => {
            if (item.action === "signOut") {
                e.preventDefault();
                signOut();
            }
        };

        // L'item parent est actif uniquement si le pathname correspond exactement à son path.
        const parentActive = pathname === getPathnameOnly(item.path);

        // true si un enfant (ou petit-enfant) est actif.
        const childActive = item.subMenuItems?.some(sub => isItemOrChildActive(sub));

    // ------------------------------------------------------------
    // Mode SIDENAV RÉDUITE
    // ------------------------------------------------------------
    // Rendu compact:
    // - item = icône centrée
    // - sous-menu = flyout au hover
    // - item actif = teinte primary
    // ------------------------------------------------------------
    if (isCollapsed) {
        const menuContent = (
            // Bloc d'icône standard utilisé pour tous les items en mode réduit.
            <div
             className={`cursor-pointer flex items-center justify-center h-10 w-10 rounded-lg transition hover:bg-lighthover hover:text-primary
                    ${parentActive ? "text-primary" : ""}
                    ${childActive && !parentActive ? "text-primary" : ""}`}
            >
                {item.icon}
            </div>
        );

        // Si l'item contient un sous-menu, on affiche un flyout à droite au survol.
        if (item.subMenu) {
            return (
                <div className="relative group">
                    {/* Icône visible en permanence dans la colonne réduite. */}
                    {menuContent}

                    {/*
                      Flyout secondaire:
                      - caché par défaut
                      - visible quand l'item parent est hover
                    */}
                    <div
                     className="absolute left-full top-0 ml-4 hidden group-hover:flex flex-col
                     bg-dark text-lighthover rounded-lg shadow-400 p-3 z-50 min-w-[180px]">

                        {/*
                          Zone tampon entre la sidebar et le flyout,
                          pour éviter une fermeture involontaire pendant le déplacement de souris.
                        */}
                        <div className="absolute -left-4 top-0 h-full w-4"/>

                        {/* Titre du bloc parent en en-tête du flyout. */}
                        <span className="font-semibold text-base mb-3 text-light">{item.title}</span>

                        {/* Liste des sous-items de niveau 1. */}
                        <div className="flex flex-col space-y-1">
                            {item.subMenuItems?.map((subItem, idx) => {
                                const subPath = resolvePath(subItem.path, subItem.requiredParams);
                                const isNestedOpen = openNestedSubMenuIndex === idx;
                                return (
                                    <div key={idx} className="flex flex-col">
                                        {/* Ligne du sous-item + chevron si ce sous-item possède des enfants. */}
                                        <div className="flex items-center justify-between gap-2">
                                            <Link
                                             href={subPath}
                                             className={`flex flex-1 items-center gap-2 whitespace-nowrap text-sm rounded-lg px-3 py-2
                                                        hover:bg-lighthover hover:text-primary
                                             ${pathname === subPath ? "font-semibold text-primary" : ""}`}>
                                                {subItem.title}
                                            </Link>

                                            {/*
                                              Chevron uniquement pour les sous-items ayant un niveau 2.
                                              Le clic ne navigue pas: il ouvre/ferme la liste imbriquée.
                                            */}
                                            {subItem.subMenu && subItem.subMenuItems && subItem.subMenuItems.length > 0 && (
                                                <button
                                                 type="button"
                                                 onClick={() => toggleNestedSubMenu(idx)}
                                                 className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-lighthover hover:text-primary"
                                                >
                                                    <FontAwesomeIcon
                                                     className={`text-xs transition-transform ${isNestedOpen ? "rotate-180" : ""}`}
                                                     icon={Icons.chevronDown}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        {/* Sous-menu de niveau 2 conditionnel (affiché uniquement si ouvert). */}
                                        {subItem.subMenu && subItem.subMenuItems && subItem.subMenuItems.length > 0 && isNestedOpen && (
                                            <div className="ml-3 mt-1 flex flex-col space-y-1 border-l border-lighthover/30 pl-2">
                                                {subItem.subMenuItems.map((nestedSubItem, nestedIdx) => {
                                                    const nestedPath = resolvePath(nestedSubItem.path, nestedSubItem.requiredParams);
                                                    return (
                                                        // Lien final de niveau 2.
                                                        <Link
                                                         key={`${idx}-${nestedIdx}`}
                                                         href={nestedPath}
                                                         className={`flex items-center gap-2 whitespace-nowrap text-sm rounded-lg px-3 py-2
                                                                    hover:bg-lighthover hover:text-primary
                                                         ${pathname === nestedPath ? "font-semibold text-primary" : ""}`}>
                                                            {nestedSubItem.title}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        // Item simple sans sous-menu:
        // - rendu icône
        // - titre disponible via tooltip au survol.
        return (
            <Tooltip content={item.title} position="rightMenu">
                <Link href={item.path} onClick={handleClick}>
                    {menuContent}
                </Link>
            </Tooltip>
        );
    }

    // ------------------------------------------------------------
    // Mode SIDENAV OUVERTE
    // ------------------------------------------------------------
    // Rendu étendu:
    // - icône + label
    // - chevron pour sous-menu principal
    // - niveau 2 piloté par chevrons internes
    // ------------------------------------------------------------
    return (
        <div className="">
            {/* Cas item avec sous-menu principal. */}
            {item.subMenu ? (
                <>
                {/*
                  Ligne parent du menu:
                  - clic => ouvre/ferme le sous-menu principal
                  - active style si parent actif ou descendant actif
                */}
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

                        {/* Chevron principal qui reflète l'ouverture du niveau 1. */}
                        <div className={`${isSubMenuOpen ? 'rotate-180' : ""} flex`}>
                            <FontAwesomeIcon className="text-sm" icon={Icons.chevronDown}></FontAwesomeIcon>
                        </div>
                    </button>

                    {/*
                      Conteneur animé du sous-menu principal:
                      - reste monté
                      - anime hauteur + opacité selon isSubMenuOpen
                    */}
                        <div className={`transition-all duration-300 ease-in-out
                                        ${isSubMenuOpen ? "max-h-[70vh] opacity-100 overflow-y-auto pr-1" : "max-h-0 opacity-0 overflow-hidden"}`}>
                            {/* Liste des items enfants (niveau 1). */}
                            <div className="my-2 ml-2 flex flex-col space-y-5 text-lighthover w-fit p-2">
                                {item.subMenuItems?.map((subItem, idx) => {
                                    const path = resolvePath(subItem.path, subItem.requiredParams);
                                    const isNestedOpen = openNestedSubMenuIndex === idx;
                                    return (
                                        <div key={idx} className="flex flex-col gap-2">
                                            {/* Ligne du sous-item + chevron optionnel niveau 2. */}
                                            <div className="flex items-center justify-between gap-2">
                                                <Link
                                                href={path}
                                                className={`flex flex-1 gap-3 items-center p-2 rounded-lg transition
                                                            ${pathname === path ? 'font-semibold text-primary' : 'hover:bg-lighthover hover:text-primary'}`}
                                                >
                                                    <span className="flex gap-3 items-center">{subItem.icon}{subItem.title}</span>
                                                </Link>

                                                {/*
                                                  Bouton de toggle des enfants de niveau 2,
                                                  uniquement si le sous-item en possède.
                                                */}
                                                {subItem.subMenu && subItem.subMenuItems && subItem.subMenuItems.length > 0 && (
                                                    <button
                                                     type="button"
                                                     onClick={() => toggleNestedSubMenu(idx)}
                                                     className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-lighthover hover:text-primary"
                                                    >
                                                        <FontAwesomeIcon
                                                         className={`text-xs transition-transform ${isNestedOpen ? 'rotate-180' : ''}`}
                                                         icon={Icons.chevronDown}
                                                        />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Sous-items de niveau 2 affichés uniquement quand ce bloc est ouvert. */}
                                            {subItem.subMenu && subItem.subMenuItems && subItem.subMenuItems.length > 0 && isNestedOpen && (
                                                <div className="ml-6 flex flex-col gap-2 border-l border-lighthover/30 pl-4">
                                                    {subItem.subMenuItems.map((nestedSubItem, nestedIdx) => {
                                                        const nestedPath = resolvePath(nestedSubItem.path, nestedSubItem.requiredParams);
                                                        return (
                                                            // Lien final de navigation niveau 2 (avec mise en évidence active).
                                                            <Link
                                                            key={`${idx}-${nestedIdx}`}
                                                            href={nestedPath}
                                                            className={`flex gap-3 items-center p-2 rounded-lg transition
                                                                        ${pathname === nestedPath ? 'font-semibold text-primary' : 'hover:bg-lighthover hover:text-primary'}`}
                                                            >
                                                                <span className="flex gap-3 items-center">{nestedSubItem.icon}{nestedSubItem.title}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                </>
            ) : (
                // Cas item simple sans sous-menu:
                // - navigation directe via Link
                // - style actif quand pathname correspond exactement
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