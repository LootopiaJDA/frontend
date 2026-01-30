"use client";

import { X, MapPin, Loader2, Upload, Navigation } from "lucide-react";
import { useState } from "react";

import { Chasse } from "@/types/chasse.types";
import { createEtape } from "@/app/lib/api/etape";

interface CreateEtapeModalProps {
    chasses: Chasse[];
    onClose: () => void;
    onCreated: () => void;
}

export function CreateEtapeModal({ chasses, onClose, onCreated }: CreateEtapeModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    console.log(chasses)
    const [formData, setFormData] = useState({
        idChasse: "",
        name: "",
        lat: "",
        long: "",
        address: "",
        description: "",
        rayon: "",
        rank: "",
        image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!formData.idChasse) {
            setError("Veuillez sélectionner une chasse");
            return;
        }

        if (!formData.image) {
            setError("Veuillez sélectionner une image");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("lat", formData.lat);
            data.append("long", formData.long);
            data.append("address", formData.address);
            data.append("description", formData.description);
            data.append("rayon", formData.rayon);
            data.append("rank", formData.rank);
            data.append("image", formData.image);

            await createEtape(Number(formData.idChasse), data);
            setSuccess(true);

            // Fermer après 1.5 secondes
            setTimeout(() => {
                onCreated();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    const activeChassesList = chasses.filter((c) => c.etat === "ACTIVE" || c.etat === "PENDING");

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Créer une étape</h2>
                            <p className="text-emerald-100 text-sm">Ajoutez une nouvelle étape à votre chasse</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Étape créée avec succès !
                        </div>
                    )}

                    {/* Sélection de la chasse */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Chasse associée *
                        </label>
                        <select
                            required
                            value={formData.idChasse}
                            onChange={(e) => setFormData({ ...formData, idChasse: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                            <option value="">Sélectionner une chasse</option>
                            {activeChassesList.map((chasse) => (
                                <option key={chasse.id_chasse} value={chasse.id_chasse}>
                                    {chasse.name} ({chasse.etat})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nom de l'étape */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nom de l'étape *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Indice 1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Description / Indice *
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Je suis bleu et orange..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Coordonnées GPS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Latitude *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                placeholder="41°24'12.2&quot;N"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Longitude *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.long}
                                onChange={(e) => setFormData({ ...formData, long: e.target.value })}
                                placeholder="2°10'26.5&quot;E"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Adresse *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="3 rue de la libertée"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Rayon et Rang */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Rayon (mètres) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.rayon}
                                onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
                                placeholder="35"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Ordre de l'étape *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.rank}
                                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                                placeholder="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Image de l'étape *
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="etape-image"
                                required
                            />
                            <label
                                htmlFor="etape-image"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Upload className="w-10 h-10" />
                                        <p className="text-sm font-medium">
                                            Cliquez pour sélectionner une image
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-5 h-5" />
                                    Créer l'étape
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}