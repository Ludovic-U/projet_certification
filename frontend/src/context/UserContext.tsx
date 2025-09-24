"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api_backend from "@/api/axiosInstance";
import { useRouter } from "next/navigation";

// Type qui définit la structure d'un utilisateur (null = pas d'utilisateur connecté)
type User = {
    userId: number;
    roles: string[];
    clientId?: number;
    isManager?: boolean;
    position?: string | null;
} | null;

// Type qui définit la structure d'un contexte utilisateur (ce qui sera accessible dans tous les composants enfants)
type UserContextType = {
    user: User;
    setUser: (user: User) => void;
    loading: boolean;
    signOut: () => Promise<void>;
}

// Le contexte permet de partager les données entre les composants sans les passer via props
const UserContext = createContext<UserContextType | undefined>(undefined);

// Composant Provider qui encapsule l'app et fournit les données utilisateur
export function UserProvider({ children }: { children: React.ReactNode }) {
    // Etat pour stocker les informations de l'utilisateur connecté
    const [user, setUser] = useState<User>(null);
    // Etat pour gérer l'état de chargement pendant la récupération des données
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Récupération des données utilisateur au montage
    useEffect(() => {
        async function fetchMe() {
            try {
                // Appel API pour récupérer les informations de l'utilisateur connecté
                const res = await api_backend.get("me");
                // Mise à jour de l'état utilisateur avec les données reçues
                setUser(res.data.user);
                console.log("Data de 'me' récupérées")
            } catch {
                // En cas d'erreur, on définit l'utilisateur comme null
                setUser(null);
                console.log("Erreur lors de la récupération des données de 'me'")
            } finally {
                // Qu'il y ait succès ou erreur, on arrête le chargement.
                setLoading(false);
            }
        }
        // Exécution de la fonction de récupération
        fetchMe();
    }, []);

    // Deconnecte l'utilisateur
    const signOut = async () => {
        console.log("signOut appelé")
        console.log("URL finale:", api_backend.defaults.baseURL + "user/logout");
        try {
            const res = await api_backend.post("user/logout");
            console.log("Logout réponse API: ", res);
            setUser(null);
            console.log("User déconnecté")
            window.location.href = "/";
        } catch (error: any) {
            console.error("Erreur lors du logout :", error.response || error?.message || error)
        }
    }

    // Redirection automatique si user = null
    useEffect(() => {
        if (!loading && user === null) {
            router.replace("/");
        }
    }, [user, loading]);

    // Le provider fournit les valeurs à tous ses composents enfants.
    return (
        <UserContext.Provider value = {{ user, setUser, loading, signOut }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser doit être utilisé dans le UserProvider");
    return context;
}