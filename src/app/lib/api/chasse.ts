import { Chasse } from "@/types/chasse.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getChassesByPartenaire(
    partenaireId: number
): Promise<Chasse[]> {
    const res = await fetch(
        `${API_URL}/chasse/partenaire/${partenaireId}`,
        {
            credentials: "include",
        }
    );

    if (!res.ok) {
        throw new Error("Impossible de charger les chasses du partenaire");
    }

    const data = await res.json();
    return data.chasse;
}

export async function getChasse(id: number): Promise<Chasse> {
    const res = await fetch(`${API_URL}/chasse/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Chasse introuvable");
    return res.json();
}

export async function deleteChasse(id: number) {
    return fetch(`${API_URL}/chasse/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}

export async function createChasse(formData: FormData) {
    const res = await fetch(`${API_URL}/chasse`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!res.ok) throw new Error("Erreur création");
    return res.json();
}

export async function updateChasse(id: number, payload: Partial<Chasse>) {
    const res = await fetch(`${API_URL}/chasse/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erreur modification");
    return res.json();
}
