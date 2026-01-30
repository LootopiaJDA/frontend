"use client";

import { deleteEtape } from "@/app/lib/api/etape";
import { MapPin, Trash2, Navigation } from "lucide-react";
import { useState } from "react";
interface Etape {
    id_etape: number;
    name: string;
    description: string;
    lat: string;
    long: string;
    address: string;
    rayon: number;
    rank: number;
    image?: string;
}

interface EtapeCardProps {
    etape: Etape;
    idChasse: number;
    onDelete: () => void;
}

export function EtapeCard({ etape, idChasse, onDelete }: EtapeCardProps) {
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteEtape(idChasse, etape.id_etape);
            onDelete();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression de l'étape");
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200">
            {/* Badge Rang */}
            <div className="absolute top-3 right-3 z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">#{etape.rank}</span>
                </div>
            </div>

            {/* Image si disponible */}
            {etape.image && (
                <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                    <img
                        src={etape.image}
                        alt={etape.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            {/* Contenu */}
            <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                            {etape.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                            {etape.description}
                        </p>
                    </div>
                </div>

                {/* Détails */}
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Navigation className="w-4 h-4 text-emerald-600" />
                        <span className="truncate">{etape.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Rayon: {etape.rayon}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {etape.lat}
                        </span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {etape.long}
                        </span>
                    </div>
                </div>

                {/* Bouton Supprimer */}
                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center font-medium">
                            Confirmer la suppression ?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={deleting}
                                className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50 text-sm"
                            >
                                {deleting ? "..." : "Confirmer"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}