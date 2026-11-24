const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? 'https://buildmypc-g15-gateway.onrender.com/api'
  : 'http://localhost:8080/api')).replace(/\/$/, '');

function tokenExpirado(token) {
  try {
    const parte = token.split('.')[1];
    if (!parte) return true;
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return !Number.isFinite(Number(payload.exp)) || Number(payload.exp) * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function cerrarSesionExpirada() {
  localStorage.setItem('buildmypc_sesion_expirada', 'true');
  localStorage.removeItem('buildmypc_token');
  localStorage.removeItem('buildmypc_sesion');
  window.dispatchEvent(new Event('buildmypc:unauthorized'));
}

export async function solicitar(ruta, opciones = {}) {
  const token = localStorage.getItem('buildmypc_token');
  const rutaPublicaAuth = ruta === '/v1/auths' || ruta === '/v1/auths/login';
  if (token && !rutaPublicaAuth && tokenExpirado(token)) {
    cerrarSesionExpirada();
    throw new Error('Su sesión ha finalizado por seguridad. Por favor, ingrese nuevamente.');
  }
  const { headers: headersOpcionales, ...restoOpciones } = opciones;
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...restoOpciones,
      headers: {
        ...(restoOpciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token && !rutaPublicaAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...headersOpcionales
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(`No se pudo conectar con el Backend (${API_URL}). Verifica que el gateway y los servicios estén disponibles.`);
  }

  if (respuesta.status === 204) return null;
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401 && token && !rutaPublicaAuth) {
    cerrarSesionExpirada();
  }
  if (!respuesta.ok) {
    const mensaje = cuerpo.mensaje || cuerpo.error || cuerpo.message || Object.values(cuerpo).find((valor) => typeof valor === 'string');
    throw new Error(mensaje || `Error ${respuesta.status}: ${respuesta.statusText}`);
  }
  return cuerpo;
}

export const apiUrl = API_URL;
