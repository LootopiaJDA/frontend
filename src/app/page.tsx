"use client";

import { useState } from "react";
import { MapPin, Compass, Trophy, Star, Users, Sparkles, ArrowRight, Play, Check, Smartphone, Map, Zap, Globe } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Réalité Augmentée",
      description: "Vivez une expérience immersive : les indices prennent vie sous vos yeux.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Exploration Réelle",
      description: "Parcourez votre ville et découvrez des lieux méconnus à travers nos parcours.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Système de Points",
      description: "Gagnez des points, débloquez des badges et grimpez au classement.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mode Multijoueur",
      description: "Jouez seul ou en équipe et partagez vos découvertes.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const stats = [
    { icon: <Map className="w-8 h-8" />, value: "50+", label: "Chasses Actives", color: "indigo" },
    { icon: <Users className="w-8 h-8" />, value: "10K+", label: "Aventuriers", color: "purple" },
    { icon: <MapPin className="w-8 h-8" />, value: "25", label: "Villes", color: "pink" },
    { icon: <Star className="w-8 h-8" />, value: "4.9", label: "Note Moyenne", color: "amber" },
  ];

  const popularHunts = [
    { title: "Mystères du Vieux Bordeaux", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&q=80", category: "Histoire", participants: 1247, rating: 4.8 },
    { title: "Les Vignobles Secrets", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&q=80", category: "Nature", participants: 892, rating: 4.9 },
    { title: "Légendes de la Dune", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80", category: "Nature", participants: 654, rating: 4.7 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-10">
          {/* Left content */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Nouvelle expérience AR
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
              La chasse <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">commence ici</span>
            </h1>
            <p className="text-gray-100 text-lg sm:text-xl">
              Découvrez votre ville comme jamais avec des chasses au trésor en réalité augmentée.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <a
                href="/hunts"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                <Compass className="w-5 h-5" /> Découvrir les chasses <ArrowRight className="w-5 h-5" />
              </a>
              <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition">
                <Play className="w-5 h-5" /> Voir la démo
              </button>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 relative w-full max-w-md">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80"
                alt="AR Experience"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-xl hover:bg-gray-50 transition">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 text-white mx-auto mb-2`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">Pourquoi choisir Lootopia ?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setActiveFeature(i)}
                className={`bg-white rounded-2xl p-6 shadow hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer ${activeFeature === i ? "ring-2 ring-indigo-200" : ""
                  }`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${f.color} text-white mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black mb-8 text-center">Chasses populaires 🔥</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularHunts.map((hunt, i) => (
              <div key={i} className="bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden transition transform hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={hunt.image}
                    alt={hunt.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={400}
                    height={192}
                  />
                  <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-1 rounded-full text-xs font-semibold text-gray-900">
                    {hunt.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{hunt.title}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {hunt.participants}</div>
                    <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4" /> {hunt.rating}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">Prêt pour la chasse ? 🚀</h2>
        <p className="mb-6 text-lg sm:text-xl">Rejoignez des milliers de chercheurs et commencez votre première chasse gratuitement</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/auth/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" /> Commencer gratuitement
          </a>
        </div>
      </section>
    </div>
  );
}
