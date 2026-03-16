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
  partenaire?: Partenaire | null;
  created_at: string;
  updated_at: string;
}

export interface Occurence {
  id_occurence: number;
  date_start: string;
  date_end: string;
  limit_user: number;
  created_at: string;
  chasse_id: number;
}

export interface Chasse {
  id_chasse: number;
  name: string;
  image: string;
  localisation: string;
  etat: StatutChasse;
  created_at: string;
  idPartenaire: number;
  occurence?: Occurence[];
  etape?: Etape[];
}

export interface Etape {
  id: number;
  name: string;
  lat: string;
  long: string;
  address: string;
  description: string;
  rayon: number;
  rank: number;
  image: string;
  chasse_id: number;
  created_at: string;
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