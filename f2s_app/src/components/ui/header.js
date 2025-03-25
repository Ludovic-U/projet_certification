"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button"

export default function Header() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState("guest"); // "guest" par défaut

  // Simule une récupération du rôle utilisateur depuis le stockage local
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "guest";
    setUserRole(storedRole);
  }, []);

  // Génère les boutons dynamiquement selon le rôle et la page
  const getButtons = () => {
    if (userRole === "admin") {
      return (
        <>
          <button className="px-4 py-2 bg-red-500 text-white rounded">Admin Panel</button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded">Déconnexion</button>
        </>
      );
    }

    if (userRole === "user") {
      return (
        <>
          {location.pathname !== "/dashboard" && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded">Tableau de bord</button>
          )}
          <button className="px-4 py-2 bg-gray-500 text-white rounded">Déconnexion</button>
        </>
      );
    }

    // return ( // guest
    //   <>
    //     <button className="px-4 py-2 bg-green-500 text-white rounded">Connexion</button>
    //     <button className="px-4 py-2 bg-yellow-500 text-white rounded">Inscription</button>
    //   </>
    // );
  };

  if (pathname != "/") {
    return (
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <Button variant="secondary">Back</Button>
        {/* <h1 className="text-xl font-bold">Current page</h1> */}
        <div className="flex gap-2">{getButtons()}</div>
      </header>
    );
  }
}
