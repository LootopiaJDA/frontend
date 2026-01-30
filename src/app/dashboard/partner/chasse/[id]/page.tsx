"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    MapPin,
    Calendar,
    AlertCircle,
    Save,
    CheckCircle,
    Type,
    PlusCircle,
    Users,
    Trophy,
    Edit3,
    X,
} from "lucide-react";
import { getChasse, updateChasse } from "@/app/lib/api/chasse";
import { Chasse, ChasseEtat } from "@/types/chasse.types";
import { useEtapes } from "@/app/hooks/useEtapes";
import { EtapeCard } from "@/app/components/chasse/EtapeCard";
import { CreateEtapeModal } from "@/app/components/chasse/CreateEtapeModal";


export default function ChasseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    // Edition
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [localisation, setLocalisation] = useState("");
    const [etat, setEtat] = useState<ChasseEtat>("PENDING");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState("");

    // Etapes
    const [openEtapeModal, setOpenEtapeModal] = useState(false);
    const { etapes, loading: etapesLoading, error: etapesError, removeEtape, refetch: refetchEtapes } = useEtapes(
        chasse?.id_chasse
    );

    useEffect(() => {
        if (!id) return;

        const numId = Number(id);
        if (Number.isNaN(numId)) {
            setPageError("ID de chasse invalide");
            setLoading(false);
            return;
        }

        getChasse(numId)
            .then((data) => {
                setChasse(data);
                setName(data.name ?? "");
                setLocalisation(data.localisation ?? "");
                setEtat(data.etat ?? "PENDING");
            })
            .catch(() => setPageError("Erreur lors du chargement de la chasse"))
            .finally(() => setLoading(false));
    }, [id]);

    const hasChanges =
        chasse &&
        (name !== chasse.name ||
            localisation !== chasse.localisation ||
            etat !== chasse.etat);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chasse || !hasChanges) return;

        setSaving(true);
        setFormError("");
        setSuccess(false);

        try {
            await updateChasse(Number(id), { name, localisation, etat });

            setChasse({ ...chasse, name, localisation, etat });

            setSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setFormError("Erreur lors de la modification");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setName(chasse?.name ?? "");
        setLocalisation(chasse?.localisation ?? "");
        setEtat(chasse?.etat ?? "PENDING");
        setIsEditing(false);
        setFormError("");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Chargement de la chasse...</p>
                </div>
            </div>
        );
    }

    if (pageError || !chasse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
                    <p className="text-gray-600 mb-6">{pageError || "Chasse introuvable"}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const getEtatBadge = (etat: ChasseEtat) => {
        switch (etat) {
            case "ACTIVE":
                return "bg-green-100 text-green-700 border-green-200";
            case "PENDING":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getEtatLabel = (etat: ChasseEtat) => {
        switch (etat) {
            case "ACTIVE":
                return "✅ Active";
            case "PENDING":
                return "⏳ En attente";
            default:
                return etat;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 px-3 sm:px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header avec retour */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-xl transition-all font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Retour au dashboard</span>
                        <span className="sm:hidden">Retour</span>
                    </button>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:shadow-md transition-all border border-indigo-200"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Modifier</span>
                        </button>
                    )}
                </div>

                {/* Message de succès global */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Modifications enregistrées avec succès !</span>
                    </div>
                )}

                {/* Card principale de la chasse */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    {/* Image de couverture */}
                    <div className="relative h-48 sm:h-72 bg-gradient-to-br from-indigo-500 to-purple-500">
                        {chasse.image ? (
                            <img
                                src={chasse.image}
                                alt={chasse.name ?? "Chasse"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Trophy className="w-20 h-20 text-white opacity-50" />
                            </div>
                        )}
                        {/* Badge statut */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getEtatBadge(chasse.etat)}`}>
                                {getEtatLabel(chasse.etat)}
                            </span>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6 sm:p-8">
                        {!isEditing ? (
                            <>
                                {/* Vue normale */}
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-4">
                                    {chasse.name}
                                </h1>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Localisation</p>
                                            <p className="font-bold">{chasse.localisation || "Non définie"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Créée le</p>
                                            <p className="font-bold">
                                                {new Date(chasse.created_at).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats rapides */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-indigo-600">{etapes.length}</p>
                                        <p className="text-xs text-gray-600 font-medium">Étapes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-purple-600">0</p>
                                        <p className="text-xs text-gray-600 font-medium">Participants</p>
                                    </div>
                                    <div className="text-center col-span-2 sm:col-span-1">
                                        <p className="text-2xl font-black text-pink-600">
                                            {chasse.id_chasse}
                                        </p>
                                        <p className="text-xs text-gray-600 font-medium">ID Chasse</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Mode édition */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Modifier la chasse
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>

                                    {formError && (
                                        <div className="flex gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <span>{formError}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="font-bold text-sm flex items-center gap-2 mb-2 text-gray-700">
                                            <Type className="w-4 h-4" /> Nom de la chasse
                                        </label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Nom de la chasse"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-sm flex items-center gap-2 mb-2 text-gray-700">
                                            <MapPin className="w-4 h-4" /> Localisation
                                        </label>
                                        <input
                                            value={localisation}
                                            onChange={(e) => setLocalisation(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Ville, région..."
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-sm mb-2 block text-gray-700">
                                            Statut de la chasse
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(["PENDING", "ACTIVE"] as ChasseEtat[]).map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setEtat(value)}
                                                    className={`p-4 rounded-xl border-2 font-bold transition-all ${etat === value
                                                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                        }`}
                                                >
                                                    {getEtatLabel(value)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!hasChanges || saving}
                                            className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    Enregistrer
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* Section Étapes */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                    Étapes de la chasse
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {etapes.length} étape{etapes.length > 1 ? "s" : ""} configurée{etapes.length > 1 ? "s" : ""}
                                </p>
                            </div>
                            <button
                                onClick={() => setOpenEtapeModal(true)}
                                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Ajouter une étape
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {etapesLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                                <p className="text-gray-500 font-medium">
                                    Chargement des étapes...
                                </p>
                            </div>
                        ) : etapesError ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Erreur de chargement
                                </h3>
                                <p className="text-gray-500 mb-6">{etapesError}</p>
                                <button
                                    onClick={refetchEtapes}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : etapes.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Aucune étape configurée
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto px-4">
                                    Commencez à créer des étapes pour votre chasse au trésor
                                </p>
                                <button
                                    onClick={() => setOpenEtapeModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Créer la première étape
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {etapes
                                    .sort((a, b) => a.rank - b.rank)
                                    .map((etape) => (
                                        <EtapeCard
                                            key={etape.id_etape}
                                            etape={etape}
                                            idChasse={chasse.id_chasse}
                                            onDelete={() => removeEtape(etape.id_etape)}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal création étape */}
            {openEtapeModal && (
                <CreateEtapeModal
                    chasses={[chasse]}
                    onClose={() => setOpenEtapeModal(false)}
                    onCreated={async () => {
                        await refetchEtapes();
                        setOpenEtapeModal(false);
                    }}
                />
            )}
        </div>
    );
}