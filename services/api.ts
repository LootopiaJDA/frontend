import { API_URL, EP } from '../constants/api';
import { Chasse, Etape, User, Occurence } from '../constants/types';

const req = async (path: string, options: RequestInit = {}) => {
  const url = `${API_URL}${path}`;

  console.groupCollapsed(`➡️ REQUEST: ${url}`);
  console.log("📦 Options:", options);
  if (options.body) {
    try {
      console.log("📝 Body:", JSON.parse(options.body as string));
    } catch {
      console.log("📝 Body (raw):", options.body);
    }
  }
  console.groupEnd();

  const startTime = performance.now();
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const endTime = performance.now();

  console.groupCollapsed(`⬅️ RESPONSE: ${res.status} ${res.statusText} (${(endTime - startTime).toFixed(2)}ms)`);
  console.log("🔗 URL:", url);
  console.log("📑 Headers:", [...res.headers.entries()]);

  let data: any = {};
  try {
    data = await res.json();
    console.log("📨 Body:", data);
  } catch {
    console.log("📨 Body: (empty or non-JSON response)");
  }

  if (!res.ok) {
    console.error("❌ ERROR:", data);
    console.groupEnd();
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  console.groupEnd();
  return data;
};

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
      req(EP.LOGIN, { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => fetch(`${API_URL}${EP.LOGOUT}`, { credentials: 'include' }),
  me: (): Promise<User> => req(EP.ME),
};

// ─── USERS ─────────────────────────────────────────────────────────────────
export const userService = {
  register: (data: { username: string; email: string; password: string; role?: string }) =>
      req(EP.REGISTER, { method: 'POST', body: JSON.stringify(data) }),

  registerPartner: (data: {
    username: string; email: string; password: string;
    partenaire: { siret: string; company_name: string; adresse?: string };
  }) => req(EP.REGISTER_PARTNER, { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAll: (): Promise<User[]> => req(EP.USERS),
  getById: (id: number): Promise<User> => req(`${EP.USERS}/${id}`),
  update: (id: number, data: Partial<User>) =>
      req(`${EP.USERS}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => req(`${EP.USERS}/${id}`, { method: 'DELETE' }),
};

// ─── PARTENAIRE ────────────────────────────────────────────────────────────
export const partenaireService = {
  getAll: () => req('/partenaire'),
  updateStatut: (id: number, statut: 'ACTIVE' | 'INACTIVE' | 'VERIFICATION') =>
      req(`/partenaire/${id}`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
};

// ─── CHASSE ─────────────────────────────────────────────────────────────────
export const chasseService = {
  getAll: (): Promise<{ allChasse: Chasse[] }> => req(EP.CHASSES),

  getByPartenaire: (id: number): Promise<{ chasseByPart: Chasse[] }> =>
      req(`${EP.CHASSES}?partenaire=${id}`),

  getById: (id: number): Promise<Chasse> => req(EP.CHASSE(id)),

  create: async (formData: FormData): Promise<void> => {
    const res = await fetch(`${API_URL}${EP.CHASSE_CREATE}`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur création');
  },

  update: (id: number, data: any) =>
      req(EP.CHASSE_UPDATE(id), { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: number) => req(EP.CHASSE_DELETE(id), { method: 'DELETE' }),

  // Joueur : rejoindre une chasse
  join: (chasseId: number) =>
      req(`/chasse/${chasseId}/join`, { method: 'POST' }),

  // Joueur : mes chasses en cours
  myChasses: (): Promise<any[]> => req('/chasse/my'),

  // Joueur : étape atteinte (creuser)
  reachEtape: (chasseId: number, etapeId: number) =>
      req(`/chasse/${chasseId}/etape/${etapeId}/reach`, { method: 'POST' }),
};

// ─── ETAPE ──────────────────────────────────────────────────────────────────
export const etapeService = {
  // Récupère toutes les étapes d'une chasse via query param idChasse
  getAll: (chasseId: number): Promise<Etape[]> =>
      req(`/etape?idChasse=${chasseId}`),

  create: async (chasseId: number, formData: FormData): Promise<void> => {
    const res = await fetch(`${API_URL}${EP.ETAPE_CREATE(chasseId)}`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur création étape');
  },

  delete: (chasseId: number, etapeId: number) =>
      req(EP.ETAPE_DELETE(chasseId, etapeId), { method: 'DELETE' }),
};