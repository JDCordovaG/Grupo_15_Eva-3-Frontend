const TOKEN_KEY = 'buildmypc_token';
const SESSION_KEY = 'buildmypc_sesion';
import { solicitar } from './apiClient';

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
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    return sesion;
  },
  cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  },
  obtenerSesion() {
    try {
      const sesion = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      const token = localStorage.getItem(TOKEN_KEY);
      return sesion ? { ...sesion, ...(token ? { token } : {}) } : null;
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
