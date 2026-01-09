import { Chasse } from "@/types/chasse.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getChassesByPartenaire(
    idPartenaire: number
): Promise<Chasse[]> {
    const res = await fetch(
        `${API_URL}/chasse/getAll?partenaire=${idPartenaire}`,
        {
            credentials: "include",
        }
    );

    if (!res.ok) {
        throw new Error("Impossible de charger les chasses du partenaire");
    }

    const data = await res.json();


    return data.chasseByPart ?? [];
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

    console.log("updateChasse - ID:", id, "Payload:", payload);

    const res = await fetch(`${API_URL}/chasse/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur API:", res.status, errorText);
        throw new Error(`Erreur modification: ${res.status}`);
    }

    return res.json();
}
