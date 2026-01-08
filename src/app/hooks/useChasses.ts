"use client";

import { useEffect, useState } from "react";
import { Chasse } from "@/types/chasse.types";
import { getChassesByPartenaire } from "../lib/api/chasse";
import { useAuth } from "../providers/AuthProvider";

export function useChasses() {
    const { user, loading: authLoading } = useAuth();

    const [chasses, setChasses] = useState<Chasse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user?.partenerId) {
            setError("Partenaire introuvable");
            setLoading(false);
            return;
        }

        getChassesByPartenaire(user.partenerId)
            .then(setChasses)
            .catch(() => setError("Erreur chargement des chasses"))
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    const removeChasse = (id: number) => {
        setChasses((prev) => prev.filter((c) => c.id_chasse !== id));
    };

    return { chasses, setChasses, loading, error, removeChasse };
}
