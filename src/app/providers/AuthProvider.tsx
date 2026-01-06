"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: string;
    username: string;
    role: "JOUEUR" | "PARTENAIRE" | "ADMIN";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const decodeToken = (token: string): User => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return {
                id: payload.sub,
                username: payload.username,
                role: payload.role,
            };
        } catch (error) {
            console.error("Erreur lors du décodage du token:", error);
            throw new Error("Token invalide");
        }
    };

    // Protection des routes au chargement
    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");

        if (storedToken) {
            try {
                const decodedUser = decodeToken(storedToken);
                setToken(storedToken);
                setUser(decodedUser);

                // Redirection selon le rôle si l'utilisateur est sur une page d'auth
                if (pathname?.startsWith("/auth")) {
                    if (decodedUser.role === "ADMIN") {
                        router.push("/dashboard/admin");
                    } else if (decodedUser.role === "PARTENAIRE") {
                        router.push("/dashboard/partner");
                    } else {
                        router.push("/dashboard/player");
                    }
                }
            } catch (error) {
                // Token invalide, on le supprime
                localStorage.removeItem("access_token");
            }
        }

        setLoading(false);
    }, [pathname, router]);

    // Protection des routes dashboard
    useEffect(() => {
        if (loading) return;

        const protectedRoutes = {
            "/dashboard/admin": "ADMIN",
            "/dashboard/partner": "PARTENAIRE",
            "/dashboard/player": "JOUEUR",
        };

        for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
            if (pathname?.startsWith(route)) {
                if (!user) {
                    router.push("/auth/login");
                    return;
                }
                if (user.role !== requiredRole) {
                    // Redirection vers le bon dashboard
                    if (user.role === "ADMIN") {
                        router.push("/dashboard/admin");
                    } else if (user.role === "PARTENAIRE") {
                        router.push("/dashboard/partner");
                    } else {
                        router.push("/dashboard/player");
                    }
                }
            }
        }
    }, [user, pathname, loading, router]);

    const login = (accessToken: string) => {
        try {
            localStorage.setItem("access_token", accessToken);
            setToken(accessToken);
            const decodedUser = decodeToken(accessToken);
            setUser(decodedUser);

            // Redirection selon le rôle
            setTimeout(() => {
                if (decodedUser.role === "ADMIN") {
                    router.push("/dashboard/admin");
                } else if (decodedUser.role === "PARTENAIRE") {
                    router.push("/dashboard/partner");
                } else {
                    router.push("/dashboard/player");
                }
            }, 100);
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        setToken(null);
        router.push("/auth/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                loading,
                isAuthenticated: !!user,
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