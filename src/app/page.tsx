'use client';

import { useState } from 'react';
import { MapPin, Compass, Trophy, Star, Users, Sparkles, ArrowRight, Play, Check, Map, Smartphone, Zap, Globe } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: <Smartphone className="w-6 h-6" />,
            title: 'Réalité Augmentée',
            description: 'Vivez une expérience immersive grâce à la technologie AR. Les indices prennent vie sous vos yeux.',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <Map className="w-6 h-6" />,
            title: 'Exploration Réelle',
            description: 'Parcourez votre ville et découvrez des lieux méconnus à travers des parcours soigneusement créés.',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: 'Système de Points',
            description: 'Gagnez des points, débloquez des badges et grimpez au classement pour devenir le meilleur aventurier.',
            color: 'from-amber-500 to-orange-500'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Mode Multijoueur',
            description: 'Jouez seul ou en équipe, défiez vos amis et partagez vos découvertes avec la communauté.',
            color: 'from-green-500 to-emerald-500'
        }
    ];

    const stats = [
        { icon: <Map className="w-8 h-8" />, value: '50+', label: 'Chasses Actives', color: 'indigo' },
        { icon: <Users className="w-8 h-8" />, value: '10K+', label: 'Aventuriers', color: 'purple' },
        { icon: <MapPin className="w-8 h-8" />, value: '25', label: 'Villes', color: 'pink' },
        { icon: <Star className="w-8 h-8" />, value: '4.9', label: 'Note Moyenne', color: 'amber' }
    ];

    const testimonials = [
        {
            name: 'Sophie Martin',
            role: 'Aventurière passionnée',
            avatar: 'https://i.pravatar.cc/150?img=1',
            rating: 5,
            text: 'Une expérience incroyable ! J\'ai redécouvert ma ville sous un nouveau jour. Les énigmes en réalité augmentée sont bluffantes.'
        },
        {
            name: 'Thomas Dubois',
            role: 'Touriste enthousiaste',
            avatar: 'https://i.pravatar.cc/150?img=3',
            rating: 5,
            text: 'Parfait pour visiter une nouvelle ville de façon ludique. On a passé un super moment en famille !'
        },
        {
            name: 'Marie Lefebvre',
            role: 'Guide touristique',
            avatar: 'https://i.pravatar.cc/150?img=5',
            rating: 5,
            text: 'Je recommande à tous mes clients ! C\'est innovant, amusant et éducatif. Une vraie réussite.'
        }
    ];

    const popularHunts = [
        {
            title: 'Mystères du Vieux Bordeaux',
            image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&q=80',
            category: 'Histoire',
            difficulty: 'Moyen',
            participants: 1247,
            rating: 4.8
        },
        {
            title: 'Les Vignobles Secrets',
            image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&q=80',
            category: 'Nature',
            difficulty: 'Facile',
            participants: 892,
            rating: 4.9
        },
        {
            title: 'Légendes de la Dune',
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
            category: 'Nature',
            difficulty: 'Difficile',
            participants: 654,
            rating: 4.7
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white pt-32 pb-20">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                
                <div className="relative max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                                <Sparkles className="w-4 h-4" />
                                Nouvelle technologie en Réalité Augmentée
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                                La chasse
                                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                    commence ici
                                </span>
                            </h1>
                            
                            <p className="text-xl text-indigo-100 leading-relaxed">
                                Découvrez votre ville comme jamais avec des chasses au trésor en réalité augmentée. 
                                Explorez, résolvez des énigmes et gagnez des récompenses !
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a href="/hunts" className="group relative inline-flex items-center gap-2">
                                    <div className="absolute inset-0 bg-white rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                                    <div className="relative bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2">
                                        <Compass className="w-5 h-5" />
                                        Découvrir les chasses
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </a>
                                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all border-2 border-white/30">
                                    <Play className="w-5 h-5" />
                                    Voir la démo
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-300" />
                                    <span className="text-sm text-indigo-100">Gratuit à commencer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-300" />
                                    <span className="text-sm text-indigo-100">Multijoueur</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-300" />
                                    <span className="text-sm text-indigo-100">Tous âges</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Hero Image/Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur-3xl opacity-30 animate-pulse" />
                            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                                {/* <Image
                                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80"
                                    alt="AR Experience"
                                    className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                                    width={400}
                                    height={600}
                                /> */}
                                
                                {/* Floating Cards */}
                                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-4 transform hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-3 rounded-lg">
                                            <Trophy className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">500+</div>
                                            <div className="text-sm text-gray-600">Points gagnés</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-2xl p-4 transform hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-100 p-3 rounded-lg">
                                            <Star className="w-6 h-6 text-amber-600 fill-current" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">4.9</div>
                                            <div className="text-sm text-gray-600">Note moyenne</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center space-y-3 p-6 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 text-white`}>
                                    {stat.icon}
                                </div>
                                <div className="text-3xl md:text-4xl font-black text-gray-900">{stat.value}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                            Pourquoi choisir Lootopia ?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Une expérience unique qui combine technologie, exploration et gamification
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setActiveFeature(index)}
                                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer ${
                                    activeFeature === index ? 'ring-4 ring-indigo-200' : ''
                                }`}
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Hunts Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                Chasses populaires 🔥
                            </h2>
                            <p className="text-xl text-gray-600">
                                Les aventures préférées de notre communauté
                            </p>
                        </div>
                        <a href="/hunts" className="hidden md:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group">
                            Voir tout
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {popularHunts.map((hunt, index) => (
                            <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden transform hover:-translate-y-2">
                                <div className="relative h-48 overflow-hidden">
                                    {/* <Image
                                        src={hunt.image}
                                        alt={hunt.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        width={400}
                                        height={192}
                                    /> */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                                        {hunt.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                        {hunt.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="w-4 h-4" />
                                            {hunt.participants}
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            {hunt.rating}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8 md:hidden">
                        <a href="/hunts" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold">
                            Voir toutes les chasses
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                            Ils adorent Lootopia ❤️
                        </h2>
                        <p className="text-xl text-gray-600">
                            Des milliers de chasses satisfaits
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    {/* <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-14 h-14 rounded-full"
                                        width={400}
                                        height={192}
                                    /> */}
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                
                <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black">
                        Prêt pour la chasse ? 🚀
                    </h2>
                    <p className="text-xl text-indigo-100">
                        Rejoignez des milliers de chercheurs et commencez votre première chasse dès maintenant
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="/register" className="group relative inline-flex items-center gap-2">
                            <div className="absolute inset-0 bg-white rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Commencer gratuitement
                            </div>
                        </a>
                        <a href="/partners" className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all border-2 border-white/30">
                            <Globe className="w-5 h-5" />
                            Devenir partenaire
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}