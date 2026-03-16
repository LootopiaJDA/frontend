export const API_URL = 'http://10.111.0.160:3000';

export const EP = {
  LOGIN: '/connexion',
  LOGOUT: '/connexion/logout',
  ME: '/user/personnalData',
  REGISTER: '/user',
  REGISTER_PARTNER: '/user/partenaire',
  USERS: '/user',
  CHASSES: '/chasse/getAll',
  CHASSE: (id: number) => `/chasse/${id}`,
  CHASSE_CREATE: '/chasse',
  CHASSE_UPDATE: (id: number) => `/chasse/update/${id}`,
  CHASSE_DELETE: (id: number) => `/chasse/delete/${id}`,
  // Etape
  ETAPES: (chasseId: number) => `/etape/${chasseId}`,
  ETAPE_CREATE: (chasseId: number) => `/etape/${chasseId}`,
  ETAPE_DELETE: (chasseId: number, etapeId: number) => `/etape/${chasseId}/${etapeId}`,
};
