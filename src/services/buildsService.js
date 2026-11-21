import { solicitar } from './apiClient';

export const buildsService = {
  listarPorUsuario: (usuarioId, opciones = {}) => solicitar(`/v1/builds/usuario/${usuarioId}`, opciones),
  crear: (build) => solicitar('/v1/builds', { method: 'POST', body: JSON.stringify(build) }),
  actualizar: (id, build) => solicitar(`/v1/builds/${id}`, { method: 'PUT', body: JSON.stringify(build) }),
  archivar: (id) => solicitar(`/v1/builds/${id}/archivar`, { method: 'PATCH' }),
  desarchivar: (id) => solicitar(`/v1/builds/${id}/desarchivar`, { method: 'PATCH' }),
  eliminar: (id) => solicitar(`/v1/builds/${id}`, { method: 'DELETE' })
};
