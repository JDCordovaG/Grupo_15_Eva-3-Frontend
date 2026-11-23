const TOKEN_KEY = 'buildmypc_token';
const SESSION_KEY = 'buildmypc_sesion';
const SESSION_EXPIRED_KEY = 'buildmypc_sesion_expirada';
import { solicitar } from './apiClient';

export function obtenerExpiracionToken(token) {
  try {
    const parte = token.split('.')[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    const expiracion = Number(payload.exp);
    return Number.isFinite(expiracion) ? expiracion * 1000 : null;
  } catch {
    return null;
  }
}

export const authService = {
  async iniciarSesion(email, password) {
    const respuesta = await solicitar('/v1/auths/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const token = respuesta.token || respuesta.accessToken;
    if (!token) throw new Error('El Backend no devolvió un token de acceso.');

    const usuario = respuesta.usuario || respuesta.user || {};
    const sesion = {
      ...respuesta,
      token,
      usuario,
      email: usuario.email || respuesta.email || email,
      usuarioId: usuario.id || usuario.userId || respuesta.usuarioId || respuesta.userId || respuesta.id || null,
      rol: usuario.rol || respuesta.rol
    };
    localStorage.removeItem(SESSION_EXPIRED_KEY);
    localStorage.setItem(TOKEN_KEY, token);
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
      const token = localStorage.getItem(TOKEN_KEY) || sesion.token;
      const expiracion = token && obtenerExpiracionToken(token);
      if (!token || !expiracion || expiracion <= Date.now()) {
        authService.cerrarSesion({ expirada: true });
        return null;
      }
      localStorage.setItem(TOKEN_KEY, token);
      return { ...sesion, token };
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
