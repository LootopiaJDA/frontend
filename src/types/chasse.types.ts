export type ChasseEtat = "PENDING" | "ACTIVE";

export interface Chasse {
    id_chasse: number;
    name: string;
    localisation: string;
    etat: ChasseEtat;
    image: string;
    created_at: string;
}
