'use client';

import { useEffect, useState } from 'react';
import { MapPin, Star, Users, Clock, Trophy, Search, Filter, Sparkles, Map, Compass, Award, TrendingUp } from 'lucide-react';

interface Hunt {
    id: string;
    title: string;
    slug: string;
    description: string;
    partnerName: string;
    coverImage: string;
    category: string;
    difficulty: 'facile' | 'moyen' | 'difficile';
    status: string;
    featured: boolean;
    location?: { city?: string; district?: string };
    stats?: { participants?: number; averageRating?: number; totalReviews?: number; averageTime?: number };
    details?: { distance?: number; estimatedDuration?: number; totalSteps?: number; pointsReward?: number };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
}

// Données de démonstration
const mockHunts: Hunt[] = [
    {
        id: '1',
        title: 'Mystères du Vieux Bordeaux',
        slug: 'mysteres-vieux-bordeaux',
        description: 'Découvrez les secrets cachés du centre historique de Bordeaux à travers 8 énigmes en réalité augmentée',
        partnerName: 'Mairie de Bordeaux',
        coverImage: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
        category: 'Histoire',
        difficulty: 'moyen',
        status: 'active',
        featured: true,
        location: { city: 'Bordeaux', district: 'Centre' },
        stats: { participants: 1247, averageRating: 4.8, totalReviews: 342 },
        details: { distance: 3.2, estimatedDuration: 90, totalSteps: 8, pointsReward: 500 }
    },
    {
        id: '2',
        title: 'Les Vignobles Secrets',
        slug: 'vignobles-secrets',
        description: 'Une aventure œnologique interactive dans les prestigieux vignobles bordelais',
        partnerName: 'Office de Tourisme',
        coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
        category: 'Nature',
        difficulty: 'facile',
        status: 'active',
        featured: true,
        location: { city: 'Saint-Émilion', district: '' },
        stats: { participants: 892, averageRating: 4.9, totalReviews: 198 },
        details: { distance: 5.5, estimatedDuration: 120, totalSteps: 6, pointsReward: 650 }
    },
    {
        id: '3',
        title: 'Légendes de la Dune du Pilat',
        slug: 'legendes-dune-pilat',
        description: 'Explorez la plus haute dune d\'Europe et ses mythes fascinants',
        partnerName: 'Commune d\'Arcachon',
        coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
        category: 'Nature',
        difficulty: 'difficile',
        status: 'active',
        featured: false,
        location: { city: 'Arcachon', district: 'Bassin' },
        stats: { participants: 654, averageRating: 4.7, totalReviews: 156 },
        details: { distance: 4.8, estimatedDuration: 150, totalSteps: 10, pointsReward: 800 }
    },
    {
        id: '4',
        title: 'Trésors de la Cité Médiévale',
        slug: 'tresors-cite-medievale',
        description: 'Remontez le temps dans les ruelles pavées de Saint-Émilion',
        partnerName: 'Mairie Saint-Émilion',
        coverImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
        category: 'Histoire',
        difficulty: 'moyen',
        status: 'active',
        featured: false,
        location: { city: 'Saint-Émilion', district: '' },
        stats: { participants: 1089, averageRating: 4.6, totalReviews: 287 },
        details: { distance: 2.8, estimatedDuration: 75, totalSteps: 7, pointsReward: 450 }
    },
    {
        id: '5',
        title: 'Street Art & Culture Urbaine',
        slug: 'street-art-culture',
        description: 'Découvrez les œuvres cachées et l\'histoire du street art bordelais',
        partnerName: 'Collectif Darwin',
        coverImage: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&q=80',
        category: 'Art',
        difficulty: 'facile',
        status: 'active',
        featured: false,
        location: { city: 'Bordeaux', district: 'Bastide' },
        stats: { participants: 743, averageRating: 4.5, totalReviews: 189 },
        details: { distance: 3.5, estimatedDuration: 100, totalSteps: 9, pointsReward: 550 }
    },
    {
        id: '6',
        title: 'Mystère au Miroir d\'Eau',
        slug: 'mystere-miroir-eau',
        description: 'Résolvez les énigmes autour du célèbre miroir d\'eau et ses secrets',
        partnerName: 'Bordeaux Métropole',
        coverImage: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=800&q=80',
        category: 'Urbain',
        difficulty: 'facile',
        status: 'active',
        featured: true,
        location: { city: 'Bordeaux', district: 'Quais' },
        stats: { participants: 1456, averageRating: 4.9, totalReviews: 412 },
        details: { distance: 2.2, estimatedDuration: 60, totalSteps: 5, pointsReward: 400 }
    }
];

export default function ListeChasse() {
    const [hunts, setHunts] = useState<Hunt[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

    useEffect(() => {
        // Simulation du chargement
        setTimeout(() => {
            setHunts(mockHunts);
            setLoading(false);
        }, 800);
    }, []);

    const filteredHunts = hunts.filter(hunt => {
        const matchCategory = selectedCategory === 'all' || hunt.category.toLowerCase() === selectedCategory;
        const matchSearch = hunt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hunt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hunt.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDifficulty = selectedDifficulty === 'all' || hunt.difficulty === selectedDifficulty;
        return matchCategory && matchSearch && matchDifficulty;
    });

    const difficultyConfig = {
        facile: { label: 'Facile', color: 'bg-emerald-500', icon: '🟢' },
        moyen: { label: 'Moyen', color: 'bg-amber-500', icon: '🟡' },
        difficile: { label: 'Difficile', color: 'bg-rose-500', icon: '🔴' }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
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
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                
                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            Réalité Augmentée
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                            Explorez, Découvrez,
                            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                Gagnez des Points !
                            </span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-indigo-100 max-w-3xl mx-auto font-light">
                            Des chasses au trésor immersives en réalité augmentée pour redécouvrir votre région
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 pt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{hunts.length}</div>
                                <div className="text-indigo-200 text-sm">Chasses Actives</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {hunts.reduce((acc, h) => acc + (h.stats?.participants || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-indigo-200 text-sm">Aventuriers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">4.8★</div>
                                <div className="text-indigo-200 text-sm">Note Moyenne</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une chasse, une ville, un thème..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setSelectedDifficulty('all')}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                selectedDifficulty === 'all'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            Toutes difficultés
                        </button>
                        {Object.entries(difficultyConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDifficulty(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                    selectedDifficulty === key
                                        ? `${config.color} text-white shadow-lg`
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <span>{config.icon}</span>
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Results Count */}
                <div className="mb-6 text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredHunts.length}</span> {filteredHunts.length > 1 ? 'chasses trouvées' : 'chasse trouvée'}
                </div>

                {filteredHunts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune chasse trouvée</h3>
                        <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHunts.map((hunt, index) => (
                            <div
                                key={hunt.id}
                                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-2"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image Container */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={hunt.coverImage}
                                        alt={hunt.title}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    
                                    {/* Featured Badge */}
                                    {hunt.featured && (
                                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            <Sparkles className="w-3 h-3" />
                                            Populaire
                                        </div>
                                    )}

                                    {/* Difficulty Badge */}
                                    <div className={`absolute top-3 right-3 ${difficultyConfig[hunt.difficulty].color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1`}>
                                        <span>{difficultyConfig[hunt.difficulty].icon}</span>
                                        {difficultyConfig[hunt.difficulty].label}
                                    </div>

                                    {/* Partner Name */}
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                                        {hunt.partnerName}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Category */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                            <Map className="w-3 h-3" />
                                            {hunt.category}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {hunt.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                        {hunt.description}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{hunt.location?.city}</div>
                                                <div className="text-xs text-gray-500">{hunt.details?.distance} km</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">~{hunt.details?.estimatedDuration} min</div>
                                                <div className="text-xs text-gray-500">{hunt.details?.totalSteps} étapes</div>
                                            </div>
                                        </div>
                                    </div>

                                
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-bold">{hunt.stats?.averageRating}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">{hunt.stats?.participants}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                                            <Trophy className="w-4 h-4" />
                                            +{hunt.details?.pointsReward} pts
                                        </div>
                                    </div>

                              
                                    <button className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                        <Compass className="w-5 h-5" />
                                        Commencer la chasse
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                    <div className="relative">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Vous êtes une commune ou une organisation ?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-6 max-w-2xl mx-auto">
                            Créez votre propre chasse au trésor et faites découvrir votre patrimoine de manière innovante
                        </p>
                        <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-xl inline-flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Devenir Partenaire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}