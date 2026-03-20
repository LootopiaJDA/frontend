export type Role = 'ADMIN' | 'PARTENAIRE' | 'JOUEUR';
export type StatutPartenaire = 'VERIFICATION' | 'ACTIVE' | 'INACTIVE';
export type StatutChasse = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export type StatutUserChasse = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface Partenaire {
  id_partenaire: number;
  statut: StatutPartenaire;
  siret: string;
  company_name: string;
  adresse?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id_user: number;
  username: string;
  email: string;
  role: Role;
  partenerId?: number | null;
  partener?: Partenaire | null;
  created_at: string;
  updated_at: string;
}

export interface Occurence {
  id_occurence?: number;
  date_start: string;
  date_end: string;
  limit_user: number;
  created_at?: string;
  chasse_id?: number;
}

export interface Etape {
  id_etape: number;
  name: string;
  lat: string;
  long: string;
  address?: string | null;
  description?: string | null;
  rayon?: number | null;
  rank?: number | null;
  image?: string | null;
  chasse_id?: number;
  created_at?: string;
}

// Réponse brute de GET /chasse/{id}
export interface ChasseDetail {
  name: string;
  localisation?: string | null;
  etat: string;
  image?: string | null;
  occurence: Occurence[];
  etape: Array<{
    id: number;       // l'API retourne "id"
    name: string;
    lat: string;
    long: string;
    address?: string | null;
    description?: string | null;
    rayon?: number | null;
    rank?: number | null;
    image?: string | null;
  }>;
}

export interface Chasse {
  id_chasse: number;
  name: string;
  description?: string | null;
  image?: string | null;
  localisation?: string | null;
  etat: StatutChasse;
  created_at: string;
  updated_at?: string;
  idPartenaire: number;
  partener?: Partenaire | null;
  occurence?: Occurence[];
  etapes?: Etape[];
}

export interface UserChasse {
  id_userchasse: number;
  id_user: number;
  id_chasse: number;
  started_at: string;
  completed_at?: string | null;
  statut: StatutUserChasse;
  chasse?: Chasse;
}

export interface UserChasseEtape {
  id_userchasseetape: number;
  id_userchasse: number;
  id_etape: number;
  reached_at: string;
  etape?: Etape;
}