const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export async function solicitar(ruta, opciones = {}) {
  const token = localStorage.getItem('buildmypc_token');
  const { headers: headersOpcionales, ...restoOpciones } = opciones;
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...restoOpciones,
      headers: {
        ...(restoOpciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headersOpcionales
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(`No se pudo conectar con el Backend (${API_URL}). Verifica que Eureka y el gateway estén activos.`);
  }

  if (respuesta.status === 204) return null;
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const mensaje = cuerpo.mensaje || cuerpo.error || cuerpo.message || Object.values(cuerpo).find((valor) => typeof valor === 'string');
    throw new Error(mensaje || `Error ${respuesta.status}: ${respuesta.statusText}`);
  }
  return cuerpo;
}

export const apiUrl = API_URL;
