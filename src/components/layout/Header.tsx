'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Trophy, MapPin, User, Sparkles, Link } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
                : 'bg-white/80 backdrop-blur-sm'
        }`}>
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        {/* <Image src="/logo.png" alt="Lootopia Logo" width={40} height={40} className="w-10 h-10" /> */}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <a href="/hunts" className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                            <MapPin className="w-4 h-4" />
                            Chasses
                        </a>
                        <a href="/leaderboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                            <Trophy className="w-4 h-4" />
                            Classement
                        </a>
                        <a href="/about" className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                            <Sparkles className="w-4 h-4" />
                            À propos
                        </a>
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <a href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium">
                            <User className="w-4 h-4" />
                            Connexion
                        </a>
                        <a href="/register" className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                                Inscription
                            </div>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-4 space-y-2 animate-in slide-in-from-top">
                        <a href="/hunts" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                            <MapPin className="w-5 h-5" />
                            Chasses
                        </a>
                        <a href="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                            <Trophy className="w-5 h-5" />
                            Classement
                        </a>
                        <a href="/about" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                            <Sparkles className="w-5 h-5" />
                            À propos
                        </a>
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <a href="/login" className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium">
                                <User className="w-5 h-5" />
                                Connexion
                            </a>
                            <a href="/register" className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                                Inscription gratuite
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}