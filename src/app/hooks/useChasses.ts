"use client";

import { useCallback, useEffect, useState } from "react";
import { getChassesByPartenaire, deleteChasse } from "@/app/lib/api/chasse";
import { Chasse } from "@/types/chasse.types";

export function useChasses(idPartenaire: number | undefined) {
    const [chasses, setChasses] = useState<Chasse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchChasses = useCallback(async () => {
        if (!idPartenaire || isNaN(idPartenaire)) {
            setLoading(false);
            setError("ID partenaire invalide");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const data = await getChassesByPartenaire(idPartenaire);
            setChasses(data);
        } catch (err) {
            console.error("Erreur chargement chasses:", err);
            setError("Erreur lors du chargement des chasses");
            setChasses([]);
        } finally {
            setLoading(false);
        }
    }, [idPartenaire]);

    useEffect(() => {
        fetchChasses();
    }, [fetchChasses]);

    const removeChasse = async (id: number) => {
        try {
            await deleteChasse(id);
            setChasses((prev) => prev.filter((c) => c.id_chasse !== id));
        } catch (err) {
            console.error("Erreur suppression:", err);
            throw err;
        }
    };

    const addChasseOptimistic = (chasse: Chasse) => {
        setChasses((prev) => {
            if (prev.some((c) => c.id_chasse === chasse.id_chasse)) return prev;
            return [chasse, ...prev];
        });
    };

    return {
        chasses,
        loading,
        error,
        removeChasse,
        refetch: fetchChasses,
        addChasseOptimistic,
    };
}