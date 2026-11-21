const TOKEN_KEY = 'buildmypc_token';
const SESSION_KEY = 'buildmypc_sesion';
import { solicitar } from './apiClient';

export const authService = {
  async iniciarSesion(email, password) {
    // El endpoint JWT esperado recibe credenciales y responde { token, ...usuario }.
    const respuesta = await solicitar('/v1/auths/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const token = respuesta.token || respuesta.accessToken;
    if (!token) throw new Error('El servidor no devolvió un token de acceso.');

    const sesion = { ...respuesta, token, email: respuesta.email || email };
    localStorage.setItem(TOKEN_KEY, token);
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
      return token && sesion ? { ...sesion, token } : null;
    } catch {
      return null;
    }
  },
  obtenerToken: () => localStorage.getItem(TOKEN_KEY),
  async registrar({ email, password, rol = 'CLIENTE' }) {
    return solicitar('/v1/auths', {
      method: 'POST',
      body: JSON.stringify({ email, passwordHash: password, rol })
    });
  }
};
