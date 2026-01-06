export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterUserData {
    username: string;
    email: string;
    password: string;
}

export interface RegisterPartenaireData extends RegisterUserData {
    partenaire: {
        adresse?: string;
        siret: string;
        company_name: string;
    };
}

export interface AuthResponse {
    access_token: string;
}

export interface User {
    id_user: number;
    username: string;
    email: string;
    role: 'USER' | 'PARTENAIRE' | 'ADMIN';
    partenerId?: number;
    created_at: Date;
    updated_at: Date;
}

export interface DecodedToken {
    sub: number;
    username: string;
    role: string;
    partenaire?: {
        id_partenaire: number;
        statut: string;
    };
    exp: number;
    iat: number;
}