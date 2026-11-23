function obtenerEspecificaciones(componente) {
  const porTipo = {
    CPU: [
      ['Socket', componente.socket], ['Núcleos', componente.nucleos], ['Hilos', componente.hilos],
      ['Frecuencia base', componente.frecuenciaBase != null ? `${componente.frecuenciaBase} GHz` : null],
      ['Frecuencia turbo', componente.frecuenciaTurbo != null ? `${componente.frecuenciaTurbo} GHz` : null],
      ['Consumo TDP', componente.tdpWatts ?? componente.tdp, componente.tdpWatts != null || componente.tdp != null ? ' W' : ''],
      ['Generación', componente.generacion], ['Soporta DDR4', componente.soportaDdr4 == null ? null : componente.soportaDdr4 ? 'Sí' : 'No'],
      ['Soporta DDR5', componente.soportaDdr5 == null ? null : componente.soportaDdr5 ? 'Sí' : 'No']
    ],
    GPU: [
      ['Memoria VRAM', componente.vramGb, ' GB'], ['Tipo de memoria', componente.tipoMemoria],
      ['Consumo TDP', componente.tdpWatts ?? componente.tdp, componente.tdpWatts != null || componente.tdp != null ? ' W' : ''],
      ['Largo', componente.largoMm, ' mm'], ['Puntaje base', componente.puntajeBase], ['Fabricante del chip', componente.fabricanteChip]
    ],
    Placa: [
      ['Socket', componente.socket], ['Chipset', componente.chipset], ['Tipo de RAM', componente.tipoRamSoportada || componente.tipoMemoria],
      ['Slots de RAM', componente.slotsRam], ['RAM máxima', componente.maxRamGb ?? componente.maxRAM, ' GB'], ['Formato', componente.formato]
    ],
    RAM: [
      ['Tipo DDR', componente.tipoDdr || componente.tipoMemoria], ['Capacidad', componente.capacidadGb ?? componente.capacidadGB, ' GB'],
      ['Frecuencia', componente.frecuenciaMhz, ' MHz'], ['Latencia', componente.latenciaCl != null ? `CL ${componente.latenciaCl}` : null],
      ['Módulos', componente.modulos], ['Voltaje', componente.voltaje, ' V']
    ],
    Fuente: [
      ['Potencia', componente.potenciaWatts, ' W'], ['Certificación', componente.certificacion], ['Formato', componente.formato],
      ['Modular', componente.esModular == null ? null : componente.esModular ? 'Sí' : 'No']
    ]
  };

  return (porTipo[componente.tipo] || []).filter(([, valor]) => valor !== null && valor !== undefined && valor !== '');
}

export default function DetalleComponenteView({ componente, alVolver, alAgregar }) {
  if (!componente) {
    return (
      <div className="container py-5 text-center">
        <p className="">No se ha seleccionado ningún componente.</p>
        <button className="btn btn-secondary" onClick={alVolver}>Volver al Catálogo</button>
      </div>
    );
  }

  const especificaciones = obtenerEspecificaciones(componente);
  const descripcion = componente.descripcion?.trim();

  return (
    <div className="container py-5">
      <button className="btn btn-outline-light mb-4" onClick={alVolver}><i className="bi bi-arrow-left me-2"></i>Volver</button>
      <div className="card card-custom p-4">
        <div className="row g-4">
          <div className="col-md-5 text-center">
            <img src={componente.imagen} alt={componente.modelo} className="img-fluid rounded" style={{ maxHeight: '300px' }} />
          </div>
          <div className="col-md-7">
            <span className="badge bg-success mb-2">{componente.tipo} - {componente.marca}</span>
            <h1 className="text-light">{componente.modelo}</h1>
            <h3 className="text-success my-3">${Number(componente.precio || componente.precioBase || 0).toLocaleString('es-CL')}</h3>
            <section className="mb-4" aria-labelledby="descripcion-componente">
              <h2 id="descripcion-componente" className="h5 text-light">Descripción</h2>
              <p className="text-secondary mb-0">{descripcion || 'No hay una descripción disponible para este componente.'}</p>
            </section>
            <section className="mb-4" aria-labelledby="especificaciones-componente">
              <h2 id="especificaciones-componente" className="h5 text-light">Especificaciones técnicas</h2>
              {especificaciones.length > 0
                ? <dl className="row g-0 mb-0">
                  {especificaciones.map(([etiqueta, valor, unidad = '']) => <div className="col-12 col-sm-6 border-bottom border-secondary py-2" key={etiqueta}>
                    <dt className="small text-secondary fw-normal">{etiqueta}</dt>
                    <dd className="text-light mb-0">{valor}{unidad}</dd>
                  </div>)}
                </dl>
                : <p className="text-secondary mb-0">No hay especificaciones técnicas registradas.</p>}
            </section>
            <button className="btn btn-primary-custom btn-lg w-100" onClick={() => alAgregar(componente)}>
              Agregar al Armador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
