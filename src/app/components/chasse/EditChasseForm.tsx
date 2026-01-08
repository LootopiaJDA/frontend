"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateChasse } from "@/app/lib/api/chasse";
import { Chasse, ChasseEtat } from "@/types/chasse.types";


export function EditChasseForm({
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        const updated = await updateChasse(chasse.id_chasse, {
            name,
            localisation,
            etat,
        });

        onUpdated(updated);
        setSuccess(true);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl">
            {success && (
                <p className="text-green-600 text-sm">Modifications enregistrées</p>
            )}

            <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                className="input"
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
            />

            <select
                className="input"
                value={etat}
                onChange={(e) => setEtat(e.target.value as ChasseEtat)}
            >
                <option value="PENDING">En attente</option>
                <option value="ACTIVE">Active</option>
            </select>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary flex gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Save />}
                Sauvegarder
            </button>
        </form>
    );
}
