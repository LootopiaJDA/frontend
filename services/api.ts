import { API_URL, EP } from '../constants/api';
import { Chasse, ChasseDetail, Etape, StatutChasse, User, UserChasse } from '../constants/types';

interface ChasseUpdatePayload {
  name?: string;
  localisation?: string;
  etat?: StatutChasse;
  latitude?: number;
  longitude?: number;
}

const req = async (path: string, options: RequestInit = {}) => {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let data: any = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export const authService = {
  login: (email: string, password: string) =>
      req(EP.LOGIN, { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => req(EP.LOGOUT, { method: 'GET' }),
  me: (): Promise<User> => req(EP.ME),
};

export const userService = {
  register: (data: { username: string; email: string; password: string; role?: string }) =>
      req(EP.REGISTER, { method: 'POST', body: JSON.stringify(data) }),
  registerPartner: (data: {
    username: string; email: string; password: string;
    partenaire: { siret: string; company_name: string; adresse?: string };
  }) => req(EP.REGISTER_PARTNER, { method: 'POST', body: JSON.stringify(data) }),
  getAll: (): Promise<User[]> => req(EP.USERS),
  update: (id: number, data: Partial<User>) =>
      req(`${EP.USERS}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const chasseService = {
  getAll: (localisation?: string): Promise<{ allChasse: Chasse[] }> =>
    req(localisation ? `${EP.CHASSES}?localisation=${encodeURIComponent(localisation)}` : EP.CHASSES),
  getByPartenaire: (id: number): Promise<{ chasseByPart: Chasse[] }> =>
      req(`${EP.CHASSES}?partenaire=${id}`),
  getById: (id: number): Promise<ChasseDetail> => req(EP.CHASSE(id)),
  create: async (formData: FormData): Promise<void> => {
    const res = await fetch(`${API_URL}${EP.CHASSE_CREATE}`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur création');
  },
  update: (id: number, data: ChasseUpdatePayload) =>
      req(EP.CHASSE_UPDATE(id), { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => req(EP.CHASSE_DELETE(id), { method: 'DELETE' }),
  join: (chasseId: number) => req(`/chasse/${chasseId}/join`, { method: 'POST' }),
  complete: (chasseId: number) => req(EP.CHASSE_COMPLETE(chasseId), { method: 'PATCH' }),
  getMe: (): Promise<{ chasses: UserChasse[] }> => req(EP.CHASSE_ME),
};

export const partenaireService = {
  getAll: (): Promise<any[]> => req('/partenaire'),
  updateStatut: (id: number, statut: 'ACTIVE' | 'INACTIVE' | 'VERIFICATION') =>
      req(`/partenaire/${id}`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
};

export const adminService = {
  validatePartenaire: (id: number, statut: 'ACTIVE' | 'INACTIVE') =>
      req(`/admin/partenaire/${id}/validate`, { method: 'POST', body: JSON.stringify({ statut }) }),
};

export const etapeService = {
  // L'API retourne "id" (nom Prisma), on normalise vers "id_etape" ici
  getAll: async (chasseId: number): Promise<Etape[]> => {
    const data = await req(`/etape?idChasse=${chasseId}`);
    return (Array.isArray(data) ? data : []).map((e: any) => ({
      ...e,
      id_etape: e.id_etape ?? e.id,
    }));
  },
  create: async (chasseId: number, formData: FormData): Promise<void> => {
    const res = await fetch(`${API_URL}${EP.ETAPE_CREATE(chasseId)}`, {
      method: 'POST', credentials: 'include', body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur création étape');
  },
  update: async (chasseId: number, etapeId: number, formData: FormData): Promise<void> => {
    const res = await fetch(`${API_URL}/etape/${chasseId}/${etapeId}`, {
      method: 'PATCH', credentials: 'include', body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur mise à jour étape');
  },
  delete: (chasseId: number, etapeId: number) =>
      req(EP.ETAPE_DELETE(chasseId, etapeId), { method: 'DELETE' }),
  validate: (chasseId: number, etapeId: number) =>
      req(EP.ETAPE_VALIDATE(chasseId, etapeId), { method: 'POST' }),
};
