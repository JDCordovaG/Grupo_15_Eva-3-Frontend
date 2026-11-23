import { solicitar } from './apiClient';

const rutasTecnicas = [
  ['/v1/cpus', 'cpu'],
  ['/v1/gpus', 'gpu'],
  ['/v1/placas-madre', 'placa'],
  ['/v1/rams', 'ram'],
  ['/v1/fuentes-poder', 'fuente']
];

const rutaPorTipo = { CPU: '/v1/cpus', GPU: '/v1/gpus', MOTHERBOARD: '/v1/placas-madre', RAM: '/v1/rams', PSU: '/v1/fuentes-poder' };

const tipoUi = { CPU: 'CPU', GPU: 'GPU', MOTHERBOARD: 'Placa', PLACA_MADRE: 'Placa', RAM: 'RAM', PSU: 'Fuente', FUENTE: 'Fuente' };
const imagenesPorTipo = {
  CPU: 'https://images.unsplash.com/photo-1717444308688-866a50e55a02?auto=format&fit=crop&w=800&q=80',
  GPU: 'https://images.unsplash.com/photo-1751822411356-3ebb2f435943?auto=format&fit=crop&w=800&q=80',
  Placa: 'https://images.unsplash.com/photo-1721332155545-c7a8005a2581?auto=format&fit=crop&w=800&q=80',
  RAM: 'https://images.unsplash.com/photo-1722900879089-221a411fc7c6?auto=format&fit=crop&w=800&q=80',
  Fuente: 'https://images.unsplash.com/photo-1756576170672-1123237f1d77?auto=format&fit=crop&w=800&q=80'
};

export const componentesService = {
  listarAdministracion: (opciones = {}) => solicitar('/v1/components', opciones),
  crear: (componente) => solicitar('/v1/components', { method: 'POST', body: JSON.stringify(componente) }),
  actualizar: (id, componente) => solicitar(`/v1/components/${id}`, { method: 'PUT', body: JSON.stringify(componente) }),
  desactivar: (id) => solicitar(`/v1/components/${id}/desactivar`, { method: 'PATCH' }),
  activar: (id) => solicitar(`/v1/components/${id}/activar`, { method: 'PATCH' }),
  async crearCompleto(componente, datosTecnicos) {
    const general = await solicitar('/v1/components', { method: 'POST', body: JSON.stringify(componente) });
    const rutaTecnica = rutaPorTipo[componente.tipo];
    try {
      await solicitar(rutaTecnica, { method: 'POST', body: JSON.stringify({ ...datosTecnicos, componenteId: general.id }) });
      return general;
    } catch (error) {
      try { await solicitar(`/v1/components/${general.id}/desactivar`, { method: 'PATCH' }); } catch { /* Conservamos el error del alta técnica. */ }
      throw new Error(`El componente general #${general.id} se creó, pero falló el registro de sus atributos técnicos. Quedó descontinuado para evitar que aparezca incompleto. Detalle: ${error.message}`);
    }
  },
  async eliminarCompleto(componente) {
    const rutaTecnica = rutaPorTipo[componente.tipo];
    if (rutaTecnica) {
      const registros = await solicitar(rutaTecnica);
      const registro = registros.find((item) => Number(item.componenteId) === Number(componente.id));
      if (registro) await solicitar(`${rutaTecnica}/componente/${componente.id}`, { method: 'DELETE' });
    }
    await solicitar(`/v1/components/${componente.id}`, { method: 'DELETE' });
  },
  async listar({ signal } = {}) {
    const opciones = { signal };
    const [componentes, ...respuestasTecnicas] = await Promise.all([
      solicitar('/v1/components', opciones),
      ...rutasTecnicas.map(([ruta]) => solicitar(ruta, opciones).catch(() => []))
    ]);
    const datosTecnicos = respuestasTecnicas.flat();

    return componentes
      .filter((componente) => componente.estado !== 'DESCONTINUADO' && tipoUi[componente.tipo])
      .map((componente) => {
        const tipo = tipoUi[componente.tipo] || componente.tipo;
        const tecnico = datosTecnicos.find((dato) => Number(dato.componenteId) === Number(componente.id)) || {};
        return {
          ...componente,
          ...tecnico,
          id: componente.id,
          technicalId: tecnico.id,
          tipo,
          marca: componente.marca,
          modelo: componente.modelo,
          precio: componente.precioBase,
          descontinuado: componente.estado === 'DESCONTINUADO' || tecnico.activo === false,
          socket: tecnico.socket,
          tdp: tecnico.tdpWatts,
          tipoMemoria: tecnico.tipoRamSoportada || tecnico.tipoDdr || tecnico.tipoMemoria,
          maxRAM: tecnico.maxRamGb,
          capacidadGB: tecnico.capacidadGb,
          potenciaWatts: tecnico.potenciaWatts,
          imagen: imagenesPorTipo[tipo] || ''
        };
      })
      .filter((componente) => !componente.descontinuado);
  }
};
