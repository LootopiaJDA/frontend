"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Menu,
    X,
    User,
    LogOut,
    Trophy,
    MapPin,
    Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function Header() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (loading) return null;

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-indigo-100"
                : "bg-white/80 backdrop-blur-sm"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Lootopia
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink href="/hunts" icon={<MapPin className="w-4 h-4" />}>
                            Chasses
                        </NavLink>
                        <NavLink href="/leaderboard" icon={<Trophy className="w-4 h-4" />}>
                            Classement
                        </NavLink>
                        <NavLink href="/about" icon={<Sparkles className="w-4 h-4" />}>
                            À propos
                        </NavLink>
                    </nav>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    Inscription
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={
                                        user?.role === "JOUEUR"
                                            ? "/dashboard/player"
                                            : "/dashboard/partner"
                                    }
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    Dashboard
                                </Link>

                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        {open ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {open && (
                    <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top">
                        <MobileLink href="/hunts" icon={<MapPin className="w-5 h-5" />}>
                            Chasses
                        </MobileLink>
                        <MobileLink
                            href="/leaderboard"
                            icon={<Trophy className="w-5 h-5" />}
                        >
                            Classement
                        </MobileLink>
                        <MobileLink href="/about" icon={<Sparkles className="w-5 h-5" />}>
                            À propos
                        </MobileLink>

                        <div className="pt-4 mt-2 border-t border-gray-200 space-y-2">
                            {!isAuthenticated ? (
                                <>
                                    <MobileLink href="/auth/login" icon={<User className="w-5 h-5" />}>
                                        Connexion
                                    </MobileLink>
                                    <Link
                                        href="/auth/register"
                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Inscription gratuite
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <MobileLink
                                        href={
                                            user?.role === "JOUEUR"
                                                ? "/dashboard/player"
                                                : "/dashboard/partner"
                                        }
                                        icon={<User className="w-5 h-5" />}
                                    >
                                        Dashboard
                                    </MobileLink>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Déconnexion
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

/* =========================
   Components
========================= */

function NavLink({
    href,
    children,
    icon,
}: {
    href: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
            {icon}
            {children}
        </Link>
    );
}

function MobileLink({
    href,
    children,
    icon,
}: {
    href: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
            {icon}
            {children}
        </Link>
    );
}