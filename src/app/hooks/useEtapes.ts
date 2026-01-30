import { useState, useEffect } from "react";
import { getEtape } from "../lib/api/etape";


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

export function useEtapes(idChasse?: number) {
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchEtapes = async () => {
        if (!idChasse) return;

        setLoading(true);
        setError("");

        try {
            const data = await getEtape(idChasse);
            if (data.message === "No etape found") {
                setEtapes([]);
            } else if (Array.isArray(data)) {
                setEtapes(data);
            } else {
                setEtapes([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur de chargement");
            setEtapes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEtapes();
    }, [idChasse]);

    const removeEtape = (idEtape: number) => {
        setEtapes((prev) => prev.filter((e) => e.id_etape !== idEtape));
    };

    return {
        etapes,
        loading,
        error,
        removeEtape,
        refetch: fetchEtapes,
    };
}