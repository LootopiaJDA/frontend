"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    Loader2,
} from "lucide-react";
import { Chasse } from "@/types/chasse.types";

interface ChasseCardProps {
    chasse: Chasse;
    onDelete: () => void;
}

export function ChasseCard({ chasse, onDelete }: ChasseCardProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Voulez-vous vraiment supprimer "${chasse.name}" ?`)) return;

        setDeleting(true);
        await onDelete();
        setDeleting(false);
    };

    const handleEdit = () => {
        router.push(`/dashboard/partner/chasse/${chasse.id_chasse}`);
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                <img
                    src={chasse.image}
                    alt={chasse.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge statut */}
                <div className="absolute top-3 right-3">
                    <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${chasse.etat === "ACTIVE"
                            ? "bg-green-500 text-white"
                            : "bg-amber-500 text-white"
                            }`}
                    >
                        {chasse.etat === "ACTIVE" ? "Active" : "En attente"}
                    </span>
                </div>

                {/* Bouton "Voir" au hover */}
                <button
                    onClick={handleEdit}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <div className="px-6 py-3 bg-white/95 backdrop-blur-sm rounded-xl font-bold text-gray-800 flex items-center gap-2 shadow-xl hover:bg-white transition-colors">
                        <Eye className="w-5 h-5" />
                        Voir les détails
                    </div>
                </button>
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-4">
                {/* Titre */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {chasse.name}
                    </h3>

                    {/* Localisation */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="line-clamp-1">{chasse.localisation}</span>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                        Créée le {new Date(chasse.created_at).toLocaleDateString("fr-FR")}
                    </span>
                </div>

                <div className="border-t border-gray-200" />

                <div className="flex gap-2">
                    <button
                        onClick={handleEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-colors text-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {deleting && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                            Suppression en cours...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}