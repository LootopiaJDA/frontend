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
} from "lucide-react";
import { getChasse, updateChasse } from "@/app/lib/api/chasse";
import { Chasse, ChasseEtat } from "@/types/chasse.types";

export default function ChasseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [chasse, setChasse] = useState<Chasse | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [name, setName] = useState("");
    const [localisation, setLocalisation] = useState("");
    const [etat, setEtat] = useState<ChasseEtat>("PENDING");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState("");

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
            await updateChasse(id, { name, localisation, etat });

            setChasse({ ...chasse, name, localisation, etat });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setFormError("Erreur lors de la modification");
        } finally {
            setSaving(false);
        }
    };


    /* -------------------- LOADING -------------------- */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    /* -------------------- ERROR -------------------- */
    if (pageError || !chasse) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="font-bold">{pageError || "Chasse introuvable"}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    /* -------------------- PAGE -------------------- */
    return (
        <div className="min-h-screen bg-gray-50 px-4 pt-24 pb-12">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour
                </button>

                {/* CARD */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="relative h-64">
                        <img
                            src={chasse.image ?? ""}
                            alt={chasse.name ?? "Chasse"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">{chasse.name}</h1>
                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {chasse.localisation}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(chasse.created_at).toLocaleDateString("fr-FR")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow p-6 space-y-5"
                >
                    <h2 className="text-xl font-bold">Modifier la chasse</h2>

                    {success && (
                        <div className="flex gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                            Modifications enregistrées
                        </div>
                    )}

                    {formError && (
                        <div className="flex gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="font-bold text-sm flex gap-2">
                            <Type className="w-4 h-4" /> Nom
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="font-bold text-sm flex gap-2">
                            <MapPin className="w-4 h-4" /> Localisation
                        </label>
                        <input
                            value={localisation}
                            onChange={(e) => setLocalisation(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1"
                        />
                    </div>

                    <div className="flex gap-3">
                        {(["PENDING", "ACTIVE"] as ChasseEtat[]).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setEtat(value)}
                                className={`flex-1 p-3 rounded-lg border font-bold ${etat === value
                                    ? "bg-indigo-50 border-indigo-500"
                                    : "border-gray-200"
                                    }`}
                            >
                                {value === "ACTIVE" ? "✅ Active" : "⏳ En attente"}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!hasChanges || saving}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Enregistrer
                    </button>
                </form>
            </div>
        </div>
    );
}
