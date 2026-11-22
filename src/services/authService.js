const TOKEN_KEY = 'buildmypc_token';
const SESSION_KEY = 'buildmypc_sesion';
const SESSION_EXPIRED_KEY = 'buildmypc_sesion_expirada';
import { solicitar } from './apiClient';
import { obtenerRolSesion } from '../utils/roles';

const DURACION_SESION_MS = {
  CLIENTE: 5 * 60 * 1000,
  TECNICO: 10 * 60 * 1000,
  ADMINISTRADOR: 15 * 60 * 1000
};

export const authService = {
  async iniciarSesion(email, password) {
    const respuesta = await solicitar('/v1/auths/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const token = respuesta.token || respuesta.accessToken;

    const usuario = respuesta.usuario || respuesta.user || {};
    const sesion = {
      ...respuesta,
      ...(token ? { token } : {}),
      email: usuario.email || respuesta.email || email,
      usuarioId: usuario.id || usuario.userId || respuesta.usuarioId || respuesta.userId || respuesta.id || null
    };
    const rol = obtenerRolSesion(sesion);
    const duracionMs = DURACION_SESION_MS[rol] || DURACION_SESION_MS.CLIENTE;
    sesion.iniciadaEn = Date.now();
    sesion.expiresAt = sesion.iniciadaEn + duracionMs;
    localStorage.removeItem(SESSION_EXPIRED_KEY);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    return sesion;
  },
  cerrarSesion({ expirada = false } = {}) {
    if (expirada) localStorage.setItem(SESSION_EXPIRED_KEY, 'true');
    else localStorage.removeItem(SESSION_EXPIRED_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  },
  hayAvisoSesionExpirada() {
    return localStorage.getItem(SESSION_EXPIRED_KEY) === 'true';
  },
  descartarAvisoSesionExpirada() {
    localStorage.removeItem(SESSION_EXPIRED_KEY);
  },
  obtenerSesion() {
    try {
      const sesion = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (!sesion) return null;
      const expiracion = Number(sesion.expiresAt);
      if (!Number.isFinite(expiracion) || expiracion <= Date.now()) {
        authService.cerrarSesion({ expirada: true });
        return null;
      }
      const token = localStorage.getItem(TOKEN_KEY);
      return { ...sesion, ...(token ? { token } : {}) };
    } catch {
      return null;
    }
  },
  obtenerToken: () => localStorage.getItem(TOKEN_KEY),
  obtenerUsuarioId(sesion = authService.obtenerSesion()) {
    if (!sesion) return null;
    const usuario = sesion.usuario || sesion.user || {};
    const id = usuario.id || usuario.userId || sesion.usuarioId || sesion.userId;
    return id == null ? null : Number(id);
  },
  async registrar({ email, password, rol = 'CLIENTE' }) {
    return solicitar('/v1/auths', {
      method: 'POST',
      body: JSON.stringify({ email, passwordHash: password, rol })
    });
  }
};
