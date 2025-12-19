export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    userType: 'player' | 'partner';
    avatar?: string;
    organizationName?: string;
    verified?: boolean;
    description?: string;
    website?: string;
    phone?: string;
    stats?: any;
}

export interface Hunt {
    id: string;
    title: string;
    slug: string;
    description: string;
    partnerId: string;
    partnerName: string;
    coverImage: string;
    category: string;
    difficulty: 'facile' | 'moyen' | 'difficile';
    status: string;
    featured: boolean;
    createdAt?: string;
    updatedAt?: string;
    location?: {
        city?: string;
        district?: string;
        country?: string;
        coordinates?: { lat: number; lng: number };
    };
    stats?: {
        participants?: number;
        completions?: number;
        averageRating?: number;
        totalReviews?: number;
        averageTime?: number;
        views?: number;
    };
    details?: {
        distance?: number;
        estimatedDuration?: number;
        totalSteps?: number;
        pointsReward?: number;
        ageRecommendation?: string;
        accessibility?: string;
        languages?: string[];
    };
    tags?: string[];
    requirements?: {
        minPlayers?: number;
        maxPlayers?: number;
        equipment?: string[];
        recommendations?: string[];
    };
}

declare namespace JSX {
    interface IntrinsicElements {
        'a-scene': any;
        'a-entity': any;
        'a-camera': any;
        'a-box': any;
        'a-sphere': any;
        'a-cylinder': any;
        'a-cone': any;
        'a-plane': any;
        'a-text': any;
        'a-marker': any;
        'a-torus': any;
        'a-circle': any;
        'a-sky': any;
        'a-light': any;
        'a-gltf-model': any;
    }
}

declare global {
    interface Window {
        AFRAME: any;
    }
}

export { };