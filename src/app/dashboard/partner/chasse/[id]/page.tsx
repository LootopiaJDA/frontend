"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Save,
    MapPin,
    Calendar,
    CheckCircle,
    AlertCircle,
    Type,
} from "lucide-react";
import { getChasse, updateChasse } from "@/app/lib/api/chasse";
import { Chasse, ChasseEtat } from "@/types/chasse.types";

// Next.js Page Component
export default function ChasseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getChasse(Number(id))
            .then(setChasse)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                            Chargement de la chasse...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!chasse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Chasse introuvable
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Cette chasse n'existe pas ou a été supprimée
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 px-4 pt-24 pb-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Retour au dashboard
                </button>

                {/* Carte principale */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
                    {/* Image de couverture */}
                    <div className="relative h-80 bg-gradient-to-br from-indigo-500 to-purple-600">
                        <img
                            src={chasse.image}
                            alt={chasse.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Badge statut */}
                        <div className="absolute top-6 right-6">
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${chasse.etat === "ACTIVE"
                                        ? "bg-green-500 text-white"
                                        : "bg-amber-500 text-white"
                                    }`}
                            >
                                {chasse.etat === "ACTIVE" ? "✅ Active" : "⏳ En attente"}
                            </span>
                        </div>

                        {/* Titre sur l'image */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                                {chasse.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/90">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-medium">{chasse.localisation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">
                                        Créée le{" "}
                                        {new Date(chasse.created_at).toLocaleDateString("fr-FR")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulaire d'édition */}
                <EditChasseForm chasse={chasse} onUpdated={setChasse} />
            </div>
        </div>
    );
}

/* ============================================
   FORMULAIRE D'ÉDITION
============================================ */
function EditChasseForm({
    chasse,
    onUpdated,
}: {
    chasse: Chasse;
    onUpdated: (chasse: Chasse) => void;
}) {
    const [name, setName] = useState(chasse.name);
    const [localisation, setLocalisation] = useState(chasse.localisation);
    const [etat, setEtat] = useState<ChasseEtat>(chasse.etat);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const hasChanges =
        name !== chasse.name ||
        localisation !== chasse.localisation ||
        etat !== chasse.etat;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError("");

        try {
            const updated = await updateChasse(chasse.id_chasse, {
                name,
                localisation,
                etat,
            });

            onUpdated(updated);
            setSuccess(true);

            // Cacher le message après 3 secondes
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setError("Erreur lors de la modification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6"
        >
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Modifier la chasse
                </h2>
                <p className="text-sm text-gray-500">
                    Mettez à jour les informations de votre chasse
                </p>
            </div>

            {/* Messages */}
            {success && (
                <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl animate-in slide-in-from-top">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">
                        Modifications enregistrées avec succès !
                    </span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-in slide-in-from-top">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Nom */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Type className="w-4 h-4 text-indigo-600" />
                    Nom de la chasse
                </label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Localisation */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Localisation
                </label>
                <input
                    type="text"
                    required
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Statut */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                    Statut de la chasse
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setEtat("PENDING")}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 font-bold transition-all ${etat === "PENDING"
                                ? "border-amber-500 bg-amber-50 text-amber-700 shadow-md"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            } disabled:opacity-50`}
                    >
                        <span className="block text-2xl mb-1">⏳</span>
                        <span className="block">En attente</span>
                        <span className="block text-xs opacity-75 mt-1">
                            En cours de validation
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setEtat("ACTIVE")}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 font-bold transition-all ${etat === "ACTIVE"
                                ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            } disabled:opacity-50`}
                    >
                        <span className="block text-2xl mb-1">✅</span>
                        <span className="block">Active</span>
                        <span className="block text-xs opacity-75 mt-1">
                            Visible aux joueurs
                        </span>
                    </button>
                </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enregistrement en cours...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {hasChanges
                                ? "Enregistrer les modifications"
                                : "Aucune modification"}
                        </>
                    )}
                </button>
                {hasChanges && !loading && (
                    <p className="text-sm text-amber-600 text-center mt-2 font-medium">
                        ⚠️ Vous avez des modifications non enregistrées
                    </p>
                )}
            </div>
        </form>
    );
}