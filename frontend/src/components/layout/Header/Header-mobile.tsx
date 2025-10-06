"use client";

import React, { ReactNode, useRef, useState} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDimensions } from "@/hooks"
import { SIDENAV_ITEMS, MenuItemWithSubMenuProps } from "../SideNav";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { motion, useCycle, Variants, TargetAndTransition } from "framer-motion"
import { Button } from "@/components/ui";
import { useUser } from "@/context/UserContext";

/*
    Variants Framer Motion pour l'animation du conteneur principal
    'open' -> cercle qui s'élargit pour révéler le menu
    'closed' -> cercle réduit à 0 qui cache le menu
*/
const sidebar: Variants = {
    open: ((height: number = 1000): TargetAndTransition => ({
        clipPath: `circle(${height * 2 + 200}px at 100% 0)`,
        transition: {
            type: "spring" as const,
            stiffness: 20,
            restDelta: 2,
        },
    })) as any,
    closed: {
        clipPath: "circle(0px at 100% 0)",
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 40
        },
    },
};


    // Variants pour la liste d'items => animation en cascade (stagger)
    // Utilisation d'un stagger pour afficher les éléments en cascade
const variants = {
    open: {
        transition: { staggerChildren: 0.02, delayChildren: 0.15 },
    },
    closed: {
        transition: { staggerChildren: 0.01, staggerDirection: -1}
    }
}

/*
    Composant principal HeaderMobile
    Affiche un menu mobile (burger menu) animé avec Framer Motion
    Le bouton toggle ouvre/ferme le menu
    Les liens sont générés dynamiquement depuis SIDENAV_ITEMS
*/
const HeaderMobile = () => {
    const pathname = usePathname(); // récupère le chemin actuel (URL path)
    const containerRef = useRef(null); // ref sur le nav principal pour mesurer hauteur
    const { height } = useDimensions(containerRef); // hook pour récupérer la hauteur
    const [isOpen, toggleOpen] = useCycle(false, true) // gestion de l'état du menu (ouvert/fermé)

    const {signOut} = useUser();
    return (
        <motion.nav
         initial={false}
         animate={isOpen ? "open" : "closed"}
         custom={height}
         className={`fixed inset-0 z-50 w-full md:hidden 
            ${isOpen ? "" : "pointer-events-none"}`
        }
         ref={containerRef}>

            {/* Cercle animé qui masque ou révèle le menu */}
            <motion.div
             className="absolute inset-0 right-0 w-full bg-light"
             variants={sidebar}/>

            <motion.ul
             className="absolute flex flex-col w-full h-full justify-around px-10 py-16"
             variants={variants}>

                <div className="flex flex-col gap-3">
                    {SIDENAV_ITEMS.map( (item, idx) => {
                        const isLastItem = idx === SIDENAV_ITEMS.length - 1;
                        return (
                            <div key={idx}>
                                {item.subMenu ? (
                                    <MenuItemWithSubMenu item={item} toggleOpen={toggleOpen}/>
                                ) : (
                                    <MenuItem>
                                        <Link
                                        href={item.path}
                                        onClick={() => toggleOpen()}
                                        className={`flex w-full text-2xl text-primary 
                                            ${item.path === pathname ? "font-bold text-primaryhover" : ""}`
                                        }
                                        >
                                            {item.title}
                                        </Link>
                                        
                                    </MenuItem>
                                )}
                                
                                {!isLastItem && (
                                    <MenuItem className="my-3 h-px w-full bg-dark"/>
                                )}
                            </div>
                        );
                    })}
                </div>
                <MenuItem>
                    <Button
                     onClick={signOut}
                     className="flex justify-self-center text-light gap-3">
                        <span>Se déconnecter</span>
                        <FontAwesomeIcon icon={Icons.logout}/>
                    </Button>
                </MenuItem>
            </motion.ul>
            <MenuToggle toggle={toggleOpen}/>
        </motion.nav>
    );
};

export default HeaderMobile;


    // Bouton animé (burger -> croix)
const MenuToggle = ({ toggle }: { toggle: any }) => (
    <button
     onClick={toggle}
     className="pointer-events-auto cursor-pointer absolute right-4 top-[14px] z-30">
        <svg width="23" height="23" viewBox="0 0 23 23">
            <Path
                variants={{
                closed: { d: 'M 2 2.5 L 20 2.5' },
                open: { d: 'M 3 16.5 L 17 2.5' },
                }}
            />
            <Path
                d="M 2 9.423 L 20 9.423"
                variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
                }}
                transition={{ duration: 0.1 }}
            />
            <Path
                variants={{
                closed: { d: 'M 2 16.346 L 20 16.346' },
                open: { d: 'M 3 2.5 L 17 16.346' },
                }}
            />
        </svg>
    </button>
);

//  Sous-composant pour les paths animés du bouton burger
const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

//  Variants pour un item de menu (animation slide + fade)
const MenuItemVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            y: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            y: { stiffness: 1000 },
            duration: 0.02,
        },
    },
};

//  Item de menu de base (animé avec variants)
const MenuItem = ({
    className,
    children,
}: {
    className?: string;
    children?: ReactNode;
}) => {
    return (
        <motion.li variants={MenuItemVariants} className={className}>
            {children}
        </motion.li>
    );
};

// Item de menu avec sous-menu déroulant
const MenuItemWithSubMenu: React.FC<MenuItemWithSubMenuProps> = ({
    item,
    toggleOpen,
}) => {
    const pathname = usePathname();
    const [subMenuOpen, setSubMenuOpen] = useState(false);

    return (
        <>
            <MenuItem>
                <button
                 className="flex w-full text-2xl"
                 onClick={() => setSubMenuOpen(!subMenuOpen)}>
                    <div className="flex flex-row gap-3 cursor-pointer font-noto text-primary">
                        <span className={`${pathname.includes(item.path) ? "font-bold text-primaryhover" : ""}`}>
                            {item.title}
                        </span>
                        <div className={`${subMenuOpen && "rotate-180"}`}>
                            <FontAwesomeIcon className="text-sm text-dark" icon={Icons.chevronDown}></FontAwesomeIcon>
                        </div>
                    </div>
                </button>
            </MenuItem>
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ml-2 mt-2 flex flex-col space-y-2
                            ${subMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0" }`}>
                        {item.subMenuItems?.map((subItem, subIdx) => {
                            return (
                                <MenuItem key={subIdx} className="text-dark font-medium">
                                    <Link
                                     href={subItem.path}
                                     onClick={() => toggleOpen()}
                                     className={`${subItem.path === pathname ? "font-bold text-primaryhover" : ""}`}
                                    >
                                        {subItem.title}
                                    </Link>
                                </MenuItem>
                            );
                        })}
            </div>
        </>
    );
};