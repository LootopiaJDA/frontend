import { API_URL, EP } from '../constants/api';
import { Chasse, ChasseDetail, Etape, User } from '../constants/types';

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
  logout: () => fetch(`${API_URL}${EP.LOGOUT}`, { credentials: 'include' }),
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
  getById: (id: number): Promise<User> => req(`${EP.USERS}/${id}`),
  update: (id: number, data: Partial<User>) =>
      req(`${EP.USERS}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => req(`${EP.USERS}/${id}`, { method: 'DELETE' }),
};

export const partenaireService = {
  getAll: () => req('/partenaire'),
  updateStatut: (id: number, statut: 'ACTIVE' | 'INACTIVE' | 'VERIFICATION') =>
      req(`/partenaire/${id}`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
};

export const chasseService = {
  getAll: (): Promise<{ allChasse: Chasse[] }> => req(EP.CHASSES),
  getByPartenaire: (id: number): Promise<{ chasseByPart: Chasse[] }> =>
      req(`${EP.CHASSES}?partenaire=${id}`),
  // Retourne la forme exacte de l'API
  getById: (id: number): Promise<ChasseDetail> => req(EP.CHASSE(id)),
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
  join: (chasseId: number) => req(`/chasse/${chasseId}/join`, { method: 'POST' }),
  myChasses: (): Promise<any[]> => req('/chasse/my'),
  reachEtape: (chasseId: number, etapeId: number) =>
      req(`/chasse/${chasseId}/etape/${etapeId}/reach`, { method: 'POST' }),
};

export const etapeService = {
  getAll: (chasseId: number): Promise<Etape[]> => req(`/etape?idChasse=${chasseId}`),
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
};