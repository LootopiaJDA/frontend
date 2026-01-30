const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getEtape(id: number) {
    const res = await fetch(`${API_URL}/etape/${id}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Impossible de charger l'étape");
    }

    const data = await res.json();
    return data;
}

export async function createEtape(idChasse: number, formData: FormData) {
    const res = await fetch(`${API_URL}/etape/${idChasse}`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur API:", res.status, errorText);
        throw new Error(`Erreur création étape: ${res.status}`);
    }

    return res.json();
}

export async function deleteEtape(idChasse: number, idEtape: number) {
    const res = await fetch(`${API_URL}/etape/${idChasse}/${idEtape}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur API:", res.status, errorText);
        throw new Error(`Erreur suppression étape: ${res.status}`);
    }

    return res.text();
}