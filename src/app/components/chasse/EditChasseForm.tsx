"use client";

import { useEffect, useState } from "react";
import {
    Loader2,
    Save,
    CheckCircle,
    AlertCircle,
    MapPin,
    Type,
} from "lucide-react";
import { updateChasse } from "@/app/lib/api/chasse";
import { Chasse, ChasseEtat } from "@/types/chasse.types";

export function EditChasseForm({
    chasse,
    onUpdated,
}: {
    chasse: Chasse;
    onUpdated: (chasse: Chasse) => void;
}) {
    const [name, setName] = useState(chasse?.name || "");
    const [localisation, setLocalisation] = useState(chasse?.localisation || "");
    const [etat, setEtat] = useState<ChasseEtat>(chasse?.etat || "PENDING");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    console.log(chasse)

    useEffect(() => {
        if (chasse) {
            setName(chasse.name || "");
            setLocalisation(chasse.localisation || "");
            setEtat(chasse.etat || "PENDING");
        }
    }, [chasse]);

    const hasChanges =
        name !== chasse?.name ||
        localisation !== chasse?.localisation ||
        etat !== chasse?.etat;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!chasse?.id_chasse) {
            setError("ID de la chasse manquant");
            console.error("ID de chasse manquant:", chasse);
            return;
        }

        if (!hasChanges) return;

        setLoading(true);
        setSuccess(false);
        setError("");

        try {
            console.log("Mise à jour de la chasse:", chasse.id_chasse, {
                name,
                localisation,
                etat,
            });

            const updated = await updateChasse(chasse.id_chasse, {
                name,
                localisation,
                etat,
            });

            onUpdated(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Erreur modification:", err);
            setError("Erreur lors de la modification");
        } finally {
            setLoading(false);
        }
    };

    // CORRECTION : Afficher un message si pas de chasse
    if (!chasse) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chasse non disponible</p>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8 space-y-6"
        >
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Modifier la chasse
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                    Mettez à jour les informations de votre chasse
                </p>
            </div>

            {/* Feedback */}
            {success && (
                <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl animate-in slide-in-from-top">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">
                        Modifications enregistrées avec succès
                    </span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-in slide-in-from-top">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Nom */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                    <Type className="w-4 h-4 text-indigo-600" />
                    Nom de la chasse
                </label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                               focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                               focus:outline-none transition-all text-sm sm:text-base
                               disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Localisation */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Localisation
                </label>
                <input
                    type="text"
                    required
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                               focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                               focus:outline-none transition-all text-sm sm:text-base
                               disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Statut */}
            <div className="space-y-3">
                <label className="text-xs sm:text-sm font-bold text-gray-700 block">
                    Statut de la chasse
                </label>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => setEtat("PENDING")}
                        disabled={loading}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-left font-bold transition-all ${etat === "PENDING"
                            ? "border-amber-500 bg-amber-50 text-amber-700 shadow-md"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                    >
                        <span className="block text-xl sm:text-2xl mb-1">⏳</span>
                        <span className="block text-sm sm:text-base">En attente</span>
                        <span className="block text-xs opacity-75 mt-1">
                            En validation
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setEtat("ACTIVE")}
                        disabled={loading}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-left font-bold transition-all ${etat === "ACTIVE"
                            ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                    >
                        <span className="block text-xl sm:text-2xl mb-1">✅</span>
                        <span className="block text-sm sm:text-base">Active</span>
                        <span className="block text-xs opacity-75 mt-1">
                            Visible aux joueurs
                        </span>
                    </button>
                </div>
            </div>

            {/* Save */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4
                               bg-gradient-to-r from-indigo-600 to-purple-600
                               text-white rounded-xl font-bold text-sm sm:text-base
                               hover:shadow-xl hover:scale-[1.01]
                               active:scale-[0.99]
                               transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed
                               disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="hidden sm:inline">Enregistrement en cours...</span>
                            <span className="sm:hidden">Enregistrement...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {hasChanges
                                ? "Enregistrer"
                                : "Aucune modification"}
                        </>
                    )}
                </button>

                {hasChanges && !loading && (
                    <p className="text-xs sm:text-sm text-amber-600 text-center mt-2 font-medium">
                        ⚠️ Modifications non enregistrées
                    </p>
                )}
            </div>
        </form>
    );
}