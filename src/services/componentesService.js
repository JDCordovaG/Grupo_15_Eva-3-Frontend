import { solicitar } from './apiClient';
import { DATOS_INICIALES_CATALOGO } from './datosSimulados';

const rutasTecnicas = [
  ['/v1/cpus', 'cpu'],
  ['/v1/gpus', 'gpu'],
  ['/v1/placas-madre', 'placa'],
  ['/v1/rams', 'ram'],
  ['/v1/fuentes-poder', 'fuente']
];

const tipoUi = { CPU: 'CPU', GPU: 'GPU', MOTHERBOARD: 'Placa', PLACA_MADRE: 'Placa', RAM: 'RAM', PSU: 'Fuente', FUENTE: 'Fuente' };

function buscarImagen(tipo, modelo) {
  const referencia = DATOS_INICIALES_CATALOGO.find((componente) =>
    componente.tipo === tipo && modelo.toLowerCase().includes(componente.modelo.toLowerCase())
  );
  return referencia?.imagen || '';
}

export const componentesService = {
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
          imagen: buscarImagen(tipo, componente.modelo)
        };
      })
      .filter((componente) => !componente.descontinuado);
  }
};
