"use client";

import { PlusCircle, Map, Users, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { ChasseCard } from "@/app/components/chasse/ChasseCard";
import { CreateChasseModal } from "@/app/components/chasse/CreateChasseModal";
import { useChasses } from "@/app/hooks/useChasses";

// Next.js Page Component
export default function PartnerDashboardPage() {
    const { chasses, loading, error, removeChasse, setChasses } = useChasses();
    const [open, setOpen] = useState(false);

    // Calculs des statistiques
    const activeChasses = chasses.filter((c) => c.etat === "ACTIVE").length;
    const pendingChasses = chasses.filter((c) => c.etat === "PENDING").length;
    const totalParticipants = chasses.length * 320; // Simulation

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 px-4 pt-24 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-red-800 mb-2">Erreur</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 px-4 pt-24 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Dashboard Partenaire
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gérez vos chasses au trésor et suivez vos statistiques
                        </p>
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Créer une chasse
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Chasses actives */}
                    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-indigo-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Map className="w-7 h-7 text-white" />
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    Actives
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-800 mb-1">
                                {activeChasses}
                            </p>
                            <p className="text-sm text-gray-500">Chasses en cours</p>
                        </div>
                    </div>

                    {/* Chasses en attente */}
                    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-amber-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                    En attente
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-800 mb-1">
                                {pendingChasses}
                            </p>
                            <p className="text-sm text-gray-500">En validation</p>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-purple-100">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                    Total
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-800 mb-1">
                                {totalParticipants.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">Joueurs inscrits</p>
                        </div>
                    </div>
                </div>

                {/* Section Chasses */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                    Mes chasses
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {chasses.length} chasse{chasses.length > 1 ? "s" : ""} au total
                                </p>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-sm">
                                    Toutes
                                </button>
                                <button className="px-4 py-2 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm">
                                    Actives
                                </button>
                                <button className="px-4 py-2 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm">
                                    En attente
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                <p className="text-gray-500 font-medium">
                                    Chargement de vos chasses...
                                </p>
                            </div>
                        ) : chasses.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Map className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Aucune chasse créée
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Commencez à créer votre première chasse au trésor et attirez
                                    des joueurs dans votre établissement
                                </p>
                                <button
                                    onClick={() => setOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Créer ma première chasse
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {chasses.map((chasse) => (
                                    <ChasseCard
                                        key={chasse.id_chasse}
                                        chasse={chasse}
                                        onDelete={() => removeChasse(chasse.id_chasse)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {open && (
                    <CreateChasseModal
                        onClose={() => setOpen(false)}
                        onCreated={(c) => setChasses((prev) => [...prev, c])}
                    />
                )}
            </div>
        </div>
    );
}