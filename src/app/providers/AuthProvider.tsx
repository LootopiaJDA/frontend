"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface User {
    id_user: number;
    username: string;
    email: string;
    role: "ADMIN" | "PARTENAIRE" | "JOUEUR";
    partenerId: number | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await fetch(`${API_URL}/user/personnalData`, {
                credentials: "include",
            });

            if (!res.ok) {
                setUser(null);
                return;
            }

            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (loading) return;

        const isDashboard = pathname.startsWith("/dashboard");
        const isAuthPage = pathname.startsWith("/auth");

        const roleRoutes: Record<string, User["role"]> = {
            "/dashboard/admin": "ADMIN",
            "/dashboard/partner": "PARTENAIRE",
            "/dashboard/player": "JOUEUR",
        };

        if (isDashboard && !user) {
            router.replace("/auth/login");
            return;
        }

        if (user && isAuthPage) {
            const targetRoute =
                user.role === "ADMIN"
                    ? "/dashboard/admin"
                    : user.role === "PARTENAIRE"
                        ? "/dashboard/partner"
                        : "/dashboard/player";

            router.replace(targetRoute);
            return;
        }

        for (const [route, requiredRole] of Object.entries(roleRoutes)) {
            if (pathname.startsWith(route)) {
                if (!user) {
                    router.replace("/auth/login");
                    return;
                }

                if (user.role !== requiredRole) {
                    const correctRoute =
                        user.role === "ADMIN"
                            ? "/dashboard/admin"
                            : user.role === "PARTENAIRE"
                                ? "/dashboard/partner"
                                : "/dashboard/player";

                    router.replace(correctRoute);
                    return;
                }
            }
        }
    }, [user, pathname, loading, router]);

    const logout = async () => {
        try {
            await fetch(`${API_URL}/connexion/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        } finally {
            setUser(null);
            router.replace("/auth/login");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
};