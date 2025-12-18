'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Users, Clock, Trophy } from 'lucide-react';

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

export default function ListeChasse() {
    const [hunts, setHunts] = useState<Hunt[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [huntsRes, categoriesRes] = await Promise.all([fetch('/api/hunts'), fetch('/api/categories')]);
                const huntsData = await huntsRes.json();
                const categoriesData = await categoriesRes.json();

                setHunts(Array.isArray(huntsData) ? huntsData.filter(h => h.status === 'active') : []);
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error('Erreur chargement chasses', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!hunts.length) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Aucune chasse disponible
            </div>
        );
    }

    const difficultyStyles: Record<string, string> = {
        facile: 'bg-green-100 text-green-700',
        moyen: 'bg-yellow-100 text-yellow-700',
        difficile: 'bg-red-100 text-red-700',
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                        🗺️ Chasses au trésor
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl">
                        Explorez votre ville à travers des expériences interactives uniques
                    </p>
                </div>

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hunts.map(hunt => (
                        <Link
                            key={hunt.id}
                            href={`/hunts/${hunt.slug}`}
                            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative h-56">
                                <img
                                    src={hunt.coverImage}
                                    alt={hunt.title}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {hunt.featured && (
                                    <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow">
                                        ⭐ Recommandé
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {hunt.category}
                                        </span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyStyles[hunt.difficulty]}`}>
                                            {hunt.difficulty}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                        {hunt.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{hunt.description}</p>
                                </div>

                                {/* Infos */}
                                <div className="grid grid-cols-2 gap-4 text-gray-600 text-sm">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        {hunt.location?.city ?? '—'}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        {hunt.stats?.averageRating ?? 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        {hunt.stats?.participants ?? 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        ~{hunt.details?.estimatedDuration ?? 0} min
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4 text-indigo-600" />
                                        +{hunt.details?.pointsReward ?? 0} pts
                                    </div>
                                    <div className="text-right">{hunt.details?.distance ?? 0} km</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
