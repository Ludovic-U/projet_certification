"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "./button-old";

import { Card } from "@/components/ui/card";
import { Bell, ArrowLeft } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState("guest"); // "guest" par défaut
  const router = useRouter();
  const [headerTitle, setHeaderTitle] = useState('');

    const api = axios.create({
        baseURL: "http://localhost:4000/api/",
        withCredentials: true,
    });

    const goToRHpage = () => {
        router.push("/rh_page");
    };

  const signOut = () => {
    api.post('/user/logout');
    router.push("/")
  };

    const goToFinancepage = () => {
        alert("PAGE EN TRAVAUX");
    };

    //Redirection du button retour en fonction de la page actuelle
    const handleBackButtonClick = () => {
        switch (pathname) {
            case "/admin":
                if (superadmin_is_connected) {
                    router.push("/super_admin");
                } else {
                    router.push("/");
                }
                break;
            case "/rh_page":
            case "/new_project":
            case "/project_overview":
                router.push("/admin");
                break;
            case "/user":
                router.push("/rh_page");
                break;
            default:
                router.push("/");
        }
    };

  // Simule une récupération du rôle utilisateur depuis le stockage local
  useEffect(() => {
    console.log(localStorage)
    const storedRole = localStorage.getItem("userRole") || "guest";
    setUserRole(storedRole);
    console.log("header componant stored role :", storedRole)

        if (pathname !== "/") {
            let title = "";
            switch (pathname) {
                case "/super_admin":
                    title = "Super-admin FIGURE DE SKILLS";
                    break;
                case "/admin":
                    title = "LAMBDA-SARL";
                    break;
                case "/rh_page":
                    title = "Mes Ressources Humaines";
                    break;
                case "/new_project":
                    title = "Créer un nouveau projet";
                    break;
                case "/project_overview":
                    title = "PROJET LAMBDA";
                    break;
                case "/user":
                    title = "Utilisateurs";
                    break;
                default:
                    title = "";
            }
            setHeaderTitle(title);
        } else {
            setHeaderTitle("");
        }
    }, [pathname]);

    // Génère les boutons dynamiquement selon le rôle et la page
    const getButtons = () => {
        if (userRole === "admin") {
            return (
                <>
                    <button className="px-4 py-2 bg-red-500 text-white rounded">
                        Admin Panel
                    </button>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded">
                        Déconnexion
                    </button>
                </>
            );
        }

    // if (userRole === "user") {
    //   return (
    //     <>
    //       {location.pathname !== "/dashboard" && (
    //         <button className="px-4 py-2 bg-blue-500 text-white rounded">Tableau de bord</button>
    //       )}
    //       <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={signOut}>Déconnexion</button>
    //     </>
    //   );
    // }
  };

    if (pathname === "/") {
        return "";
    }

    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    className="text-xl"
                    onClick={handleBackButtonClick}
                >
                    <ArrowLeft className="text-purple-600" size={24} />
                </Button>
                <span className="text-lg font-semibold text-white">
                    {headerTitle}
                </span>
            </div>
            <div className="flex space-x-2">
                <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                >
                    <Bell size={18} />
                </Button>
                <Button
                    variant="outline"
                    className="bg-purple-400 text-white"
                    onClick={goToRHpage}
                >
                    Ressources Humaines
                </Button>
                <Button
                    variant="outline"
                    className="bg-purple-400 text-white"
                    onClick={goToFinancepage}
                >
                    Finances
                </Button>
                <Button
                    variant="outline"
                    className="bg-red-400 text-white"
                    onClick={signOut}
                >
                    Se déconnecter
                </Button>
            </div>
        </header>
    );
}
