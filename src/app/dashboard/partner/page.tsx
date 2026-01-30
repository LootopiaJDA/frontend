"use client";

import { PlusCircle, Map, Loader2, AlertCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { ChasseCard } from "@/app/components/chasse/ChasseCard";
import { CreateChasseModal } from "@/app/components/chasse/CreateChasseModal";

import { useChasses } from "@/app/hooks/useChasses";
import { useAuth } from "@/app/providers/AuthProvider";
import { CreateEtapeModal } from "@/app/components/chasse/CreateEtapeModal";

export default function PartnerDashboardPage() {
    const { user } = useAuth();

    const partnerId = user?.id_user ? Number(user.id_user) : undefined;
    const { chasses, loading, error, removeChasse, refetch } = useChasses(partnerId);

    const [openChasse, setOpenChasse] = useState(false);
    const [openEtape, setOpenEtape] = useState(false);

    if (!user || !user.id_user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 px-4 pt-24 pb-12 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Authentification requise
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Vous devez être connecté en tant que partenaire pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 px-3 sm:px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Dashboard Partenaire
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-lg">
                            Gérez vos chasses au trésor et vos étapes
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setOpenChasse(true)}
                            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Créer une chasse
                        </button>

                        <button
                            onClick={() => setOpenEtape(true)}
                            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
                        >
                            <MapPin className="w-5 h-5" />
                            Créer une étape
                        </button>
                    </div>
                </div>

                {/* Section Chasses */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                                    Mes chasses
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {chasses.length} chasse{chasses.length > 1 ? "s" : ""} au total
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {loading ? (
                            <div className="py-12 sm:py-20 flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 animate-spin" />
                                <p className="text-gray-500 font-medium text-sm sm:text-base">
                                    Chargement de vos chasses...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="py-12 sm:py-20 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                    Erreur de chargement
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                                    {error}
                                </p>
                                <button
                                    onClick={refetch}
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm sm:text-base"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : chasses.length === 0 ? (
                            <div className="py-12 sm:py-20 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Map className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                    Aucune chasse créée
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                                    Commencez à créer votre première chasse au trésor et attirez
                                    des joueurs dans votre établissement
                                </p>
                                <button
                                    onClick={() => setOpenChasse(true)}
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm sm:text-base"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Créer ma première chasse
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

                {/* Modals */}
                {openChasse && (
                    <CreateChasseModal
                        onClose={() => setOpenChasse(false)}
                        onCreated={async () => {
                            await refetch();
                            setOpenChasse(false);
                        }}
                    />
                )}

                {openEtape && (
                    <CreateEtapeModal
                        chasses={chasses}
                        onClose={() => setOpenEtape(false)}
                        onCreated={() => {
                            setOpenEtape(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}