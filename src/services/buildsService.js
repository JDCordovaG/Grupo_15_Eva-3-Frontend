import { solicitar } from './apiClient';

export const buildsService = {
  listarPendientesRevision: (opciones = {}) => solicitar('/v1/builds/pendientes-revision', opciones),
  listarRevisadas: (opciones = {}) => solicitar('/v1/builds/revisadas', opciones),
  guardarObservacionesTecnicas: (id, observacionesTecnicas) => solicitar(`/v1/builds/${id}/observaciones-tecnicas`, {
    method: 'PATCH',
    body: JSON.stringify({ observacionesTecnicas })
  }),
  eliminarObservacionesTecnicas: (id) => solicitar(`/v1/builds/${id}/observaciones-tecnicas`, { method: 'DELETE' }),
  listarPorUsuario: (usuarioId, opciones = {}) => solicitar(`/v1/builds/usuario/${usuarioId}`, opciones),
  crear: (build) => solicitar('/v1/builds', { method: 'POST', body: JSON.stringify(build) }),
  actualizar: (id, build) => solicitar(`/v1/builds/${id}`, { method: 'PUT', body: JSON.stringify(build) }),
  archivar: (id) => solicitar(`/v1/builds/${id}/archivar`, { method: 'PATCH' }),
  desarchivar: (id) => solicitar(`/v1/builds/${id}/desarchivar`, { method: 'PATCH' }),
  eliminar: (id) => solicitar(`/v1/builds/${id}`, { method: 'DELETE' })
};
