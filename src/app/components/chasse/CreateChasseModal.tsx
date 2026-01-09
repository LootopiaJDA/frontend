"use client";

import { useState } from "react";
import {
    X,
    PlusCircle,
    Loader2,
    Image as ImageIcon,
    MapPin,
    AlertCircle,
    CheckCircle,
    Type,
} from "lucide-react";
import { createChasse } from "@/app/lib/api/chasse";
import { Chasse, ChasseEtat } from "@/types/chasse.types";

export function CreateChasseModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [name, setName] = useState("");
    const [localisation, setLocalisation] = useState("");
    const [etat, setEtat] = useState<ChasseEtat>("PENDING");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("L'image ne doit pas dépasser 10MB");
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!image) {
            setError("Veuillez ajouter une image");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("localisation", localisation);
            formData.append("etat", etat);
            formData.append("image", image);

            const data = await createChasse(formData);

            setSuccess("Chasse créée avec succès !");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            await onCreated();
            onClose();
        } catch {
            setError("Erreur lors de la création de la chasse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                flex items-end md:items-center justify-center 
                z-50 p-0 md:p-4">
            <div className="bg-white rounded-t-3xl md:rounded-2xl 
                w-full max-w-2xl shadow-2xl 
                animate-in slide-in-from-bottom md:zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 mb-1">
                            Créer une chasse
                        </h2>
                        <p className="text-sm text-gray-500">
                            Ajoutez une nouvelle chasse au trésor
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Messages */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-in slide-in-from-top">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl animate-in slide-in-from-top">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Nom */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Type className="w-4 h-4 text-indigo-600" />
                                Nom de la chasse *
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                placeholder="Ex: Chasse au trésor du centre-ville"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Localisation */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <MapPin className="w-4 h-4 text-purple-600" />
                                Localisation *
                            </label>
                            <input
                                type="text"
                                required
                                value={localisation}
                                onChange={(e) => setLocalisation(e.target.value)}
                                disabled={loading}
                                placeholder="Ex: Paris 5ème"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Statut */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">
                            Statut de la chasse *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setEtat("PENDING")}
                                disabled={loading}
                                className={`p-4 rounded-xl border-2 font-bold transition-all ${etat === "PENDING"
                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    } disabled:opacity-50`}
                            >
                                <span className="block text-sm mb-1">⏳</span>
                                En attente
                            </button>
                            <button
                                type="button"
                                onClick={() => setEtat("ACTIVE")}
                                disabled={loading}
                                className={`p-4 rounded-xl border-2 font-bold transition-all ${etat === "ACTIVE"
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    } disabled:opacity-50`}
                            >
                                <span className="block text-sm mb-1">✅</span>
                                Active
                            </button>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <ImageIcon className="w-4 h-4 text-pink-600" />
                            Image de la chasse *
                        </label>

                        {preview ? (
                            <div className="relative group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImage(null);
                                            setPreview("");
                                        }}
                                        disabled={loading}
                                        className="px-4 py-2 bg-white text-gray-800 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Changer l'image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group">
                                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-indigo-500 transition-colors" />
                                <p className="text-gray-700 font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                                    Cliquez pour ajouter une image
                                </p>
                                <p className="text-sm text-gray-500">
                                    PNG, JPG, JPEG jusqu'à 10MB
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !localisation || !image}
                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-5 h-5" />
                                    Créer la chasse
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}