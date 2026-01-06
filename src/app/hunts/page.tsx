"use client";

import { useEffect, useState } from "react";
import {
    MapPin,
    Star,
    Users,
    Clock,
    Trophy,
    Search,
    Sparkles,
    Map,
    Award
} from "lucide-react";

interface Hunt {
    id: string;
    title: string;
    slug: string;
    description: string;
    partnerName: string;
    coverImage: string;
    category: string;
    difficulty: "facile" | "moyen" | "difficile";
    status: string;
    featured: boolean;
    location?: { city?: string; district?: string };
    stats?: { participants?: number; averageRating?: number };
    details?: { distance?: number; estimatedDuration?: number; totalSteps?: number; pointsReward?: number };
}

// Mock Data
const mockHunts: Hunt[] = [
    {
        id: "1",
        title: "Mystères du Vieux Bordeaux",
        slug: "mysteres-vieux-bordeaux",
        description:
            "Découvrez les secrets cachés du centre historique de Bordeaux à travers 8 énigmes en réalité augmentée",
        partnerName: "Mairie de Bordeaux",
        coverImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
        category: "Histoire",
        difficulty: "moyen",
        status: "active",
        featured: true,
        location: { city: "Bordeaux", district: "Centre" },
        stats: { participants: 1247, averageRating: 4.8 },
        details: { distance: 3.2, estimatedDuration: 90, totalSteps: 8, pointsReward: 500 }
    },
    {
        id: "2",
        title: "Les Vignobles Secrets",
        slug: "vignobles-secrets",
        description:
            "Une aventure œnologique interactive dans les prestigieux vignobles bordelais",
        partnerName: "Office de Tourisme",
        coverImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
        category: "Nature",
        difficulty: "facile",
        status: "active",
        featured: true,
        location: { city: "Saint-Émilion" },
        stats: { participants: 892, averageRating: 4.9 },
        details: { distance: 5.5, estimatedDuration: 120, totalSteps: 6, pointsReward: 650 }
    }
];

export default function ListeChasse() {
    const [hunts, setHunts] = useState<Hunt[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "facile" | "moyen" | "difficile">("all");

    useEffect(() => {
        setTimeout(() => {
            setHunts(mockHunts);
            setLoading(false);
        }, 600);
    }, []);

    const difficultyConfig = {
        facile: { label: "Facile", color: "bg-emerald-500", icon: "🟢" },
        moyen: { label: "Moyen", color: "bg-amber-500", icon: "🟡" },
        difficile: { label: "Difficile", color: "bg-rose-500", icon: "🔴" }
    };

    const filteredHunts = hunts.filter((hunt) => {
        const matchesSearch =
            hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hunt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hunt.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = selectedDifficulty === "all" || hunt.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping" />
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-indigo-600 font-semibold text-lg">Chargement des aventures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Hero */}
            <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4 text-center">
                <h1 className="text-3xl sm:text-4xl font-black mb-4">
                    Explorez, découvrez et <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">gagnez des points !</span>
                </h1>
                <p className="text-indigo-100 max-w-xl mx-auto mb-6">Des chasses au trésor immersives en réalité augmentée pour redécouvrir votre région</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Commencer
                    </button>
                </div>
            </section>

            {/* Filters */}
            <section className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20 px-4 py-4">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        />
                    </div>

                    <div className="w-full max-w-xs mx-auto sm:mx-0">
                        <label htmlFor="difficulty" className="sr-only">Filtrer par difficulté</label>
                        <select
                            id="difficulty"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        >
                            <option value="all">Toutes difficultés</option>
                            {Object.entries(difficultyConfig).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
            </section>

            {/* Hunts List */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                {filteredHunts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune chasse trouvée</h3>
                        <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredHunts.map((hunt) => (
                            <div key={hunt.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col">
                                {/* Image */}
                                <div className="relative h-44 overflow-hidden">
                                    <img src={hunt.coverImage} alt={hunt.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                    {hunt.featured && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Populaire
                                        </div>
                                    )}
                                    <div className={`absolute top-2 right-2 ${difficultyConfig[hunt.difficulty].color} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                                        {difficultyConfig[hunt.difficulty].icon} {difficultyConfig[hunt.difficulty].label}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{hunt.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{hunt.description}</p>

                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-amber-500" />
                                            {hunt.stats?.averageRating}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {hunt.stats?.participants}
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                            <Trophy className="w-4 h-4" />
                                            +{hunt.details?.pointsReward} pts
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
