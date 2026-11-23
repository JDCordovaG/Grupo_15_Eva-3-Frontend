import { useEffect, useMemo, useState } from 'react';
import { buildsService } from '../services/buildsService';
import { componentesService } from '../services/componentesService';
import { obtenerRolSesion } from '../utils/roles';

const FORMULARIO_VACIO = { tipo: 'CPU', marca: '', modelo: '', precioBase: '', descripcion: '' };
const TIPOS_COMPONENTE = [
  ['CPU', 'Procesador (CPU)'],
  ['GPU', 'Tarjeta gráfica (GPU)'],
  ['MOTHERBOARD', 'Placa madre'],
  ['RAM', 'Memoria RAM'],
  ['PSU', 'Fuente de poder']
];
const CAMPOS_TECNICOS = {
  CPU: [
    ['socket', 'Socket', 'text', true], ['nucleos', 'Núcleos', 'number', true], ['hilos', 'Hilos', 'number', true],
    ['frecuenciaBase', 'Frecuencia base (GHz)', 'number', true], ['frecuenciaTurbo', 'Frecuencia turbo (GHz)', 'number', false],
    ['tdpWatts', 'TDP (W)', 'number', true], ['generacion', 'Generación', 'text', true],
    ['soportaDdr4', 'Soporta DDR4', 'boolean', false], ['soportaDdr5', 'Soporta DDR5', 'boolean', false]
  ],
  GPU: [
    ['vramGb', 'VRAM (GB)', 'number', true], ['tipoMemoria', 'Tipo de memoria', 'text', true], ['tdpWatts', 'TDP (W)', 'number', true],
    ['largoMm', 'Largo (mm)', 'number', true], ['puntajeBase', 'Puntaje base', 'number', true], ['fabricanteChip', 'Fabricante del chip', 'text', true]
  ],
  MOTHERBOARD: [
    ['socket', 'Socket', 'text', true], ['chipset', 'Chipset', 'text', true], ['tipoRamSoportada', 'Tipo de RAM', 'text', true],
    ['slotsRam', 'Slots de RAM', 'number', true], ['maxRamGb', 'RAM máxima (GB)', 'number', true], ['formato', 'Formato', 'text', true]
  ],
  RAM: [
    ['tipoDdr', 'Tipo DDR', 'text', true], ['capacidadGb', 'Capacidad (GB)', 'number', true], ['frecuenciaMhz', 'Frecuencia (MHz)', 'number', true],
    ['latenciaCl', 'Latencia CL', 'number', true], ['modulos', 'Cantidad de módulos', 'number', true], ['voltaje', 'Voltaje (V)', 'number', true]
  ],
  PSU: [
    ['potenciaWatts', 'Potencia (W)', 'number', true], ['certificacion', 'Certificación', 'text', true], ['formato', 'Formato', 'text', true],
    ['esModular', 'Fuente modular', 'boolean', false]
  ]
};
const TIPOS_UI = { CPU: 'CPU', GPU: 'GPU', MOTHERBOARD: 'Placa', PLACA_MADRE: 'Placa', RAM: 'RAM', PSU: 'Fuente', FUENTE: 'Fuente' };

function fechaLegible(fecha) {
  if (!fecha) return 'Sin fecha';
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(valor);
}

function EstadoCarga({ cargando, error, onReintentar }) {
  if (cargando) return <div className="alert alert-info" role="status"><span className="spinner-border spinner-border-sm me-2" />Cargando información...</div>;
  if (error) return <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert"><span><i className="bi bi-exclamation-circle me-2" />{error}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={onReintentar}>Reintentar</button></div>;
  return null;
}

function PanelAdministrador({ onCatalogoActualizado }) {
  const [componentes, setComponentes] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setCargando(true);
    setError('');
    componentesService.listarAdministracion({ signal: control.signal })
      .then((respuesta) => setComponentes(Array.isArray(respuesta) ? respuesta : []))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!control.signal.aborted) setCargando(false); });
    return () => control.abort();
  }, [recarga]);

  function limpiarFormulario() {
    setFormulario(FORMULARIO_VACIO);
    setEditandoId(null);
  }

  function cambiarTipo(tipo) {
    setFormulario({ ...FORMULARIO_VACIO, tipo });
  }

  function editar(componente) {
    setEditandoId(componente.id);
    setFormulario({
      tipo: componente.tipo,
      marca: componente.marca,
      modelo: componente.modelo,
      precioBase: String(componente.precioBase ?? ''),
      descripcion: componente.descripcion || ''
    });
    setError('');
    setMensaje('');
  }

  async function guardar(event) {
    event.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);
    const { tipo, marca, modelo, precioBase, descripcion, ...atributos } = formulario;
    const datos = { tipo, marca, modelo, precioBase: Number(precioBase), descripcion };
    const datosTecnicos = Object.fromEntries(CAMPOS_TECNICOS[tipo].map(([campo, , tipoCampo]) => {
      const valor = atributos[campo];
      return [campo, tipoCampo === 'number' ? Number(valor) : tipoCampo === 'boolean' ? valor === true || valor === 'true' : valor];
    }));
    try {
      if (editandoId) await componentesService.actualizar(editandoId, datos);
      else await componentesService.crearCompleto(datos, datosTecnicos);
      limpiarFormulario();
      setRecarga((actual) => actual + 1);
      onCatalogoActualizado();
      setMensaje(editandoId ? 'Componente actualizado.' : 'Componente creado y agregado al catálogo.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function desactivar(componente) {
    if (!window.confirm(`¿Desactivar ${componente.marca} ${componente.modelo}? Dejará de aparecer en el catálogo.`)) return;
    setError('');
    setMensaje('');
    try {
      const actualizado = await componentesService.desactivar(componente.id);
      setComponentes((actuales) => actuales.map((item) => item.id === componente.id ? { ...item, ...actualizado } : item));
      onCatalogoActualizado();
      setMensaje(`${componente.marca} ${componente.modelo} fue desactivado.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function activar(componente) {
    setError('');
    setMensaje('');
    try {
      const actualizado = await componentesService.activar(componente.id);
      setComponentes((actuales) => actuales.map((item) => item.id === componente.id ? { ...item, ...actualizado } : item));
      onCatalogoActualizado();
      setMensaje(`${componente.marca} ${componente.modelo} fue reactivado.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminar(componente) {
    if (!window.confirm(`¿Eliminar permanentemente ${componente.marca} ${componente.modelo}? Esta acción no se puede deshacer.`)) return;
    setError('');
    setMensaje('');
    try {
      await componentesService.eliminarCompleto(componente);
      setComponentes((actuales) => actuales.filter((item) => item.id !== componente.id));
      onCatalogoActualizado();
      setMensaje(`${componente.marca} ${componente.modelo} fue eliminado permanentemente.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return <main className="container py-5">
    <header className="mb-4">
      <p className="auth-eyebrow mb-2">OPERACIÓN DE CATÁLOGO</p>
      <h1 className="text-light fw-bold mb-1">Panel de administración</h1>
      <p className="text-secondary mb-0">Crea componentes, actualiza precios y administra su disponibilidad.</p>
    </header>

    {mensaje && <div className="alert alert-success" role="status"><i className="bi bi-check-circle me-2" />{mensaje}</div>}
    <EstadoCarga cargando={cargando} error={error && !componentes.length ? error : ''} onReintentar={() => setRecarga((actual) => actual + 1)} />
    {error && componentes.length > 0 && <div className="alert alert-danger" role="alert">{error}</div>}

    <div className="row g-4 align-items-start">
      <section className="col-12 col-xl-4" aria-labelledby="form-componente-titulo">
        <div className="card card-custom p-4">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
            <div><p className="auth-eyebrow mb-1">{editandoId ? `COMPONENTE #${editandoId}` : 'NUEVO REGISTRO'}</p><h2 id="form-componente-titulo" className="h4 mb-0">{editandoId ? 'Editar componente' : 'Crear componente'}</h2></div>
            {editandoId && <button type="button" className="btn btn-sm btn-outline-light" onClick={limpiarFormulario}>Cancelar</button>}
          </div>
          <form onSubmit={guardar}>
            <label className="form-label" htmlFor="admin-tipo">Tipo</label>
            <select id="admin-tipo" className="form-select mb-3" value={formulario.tipo} disabled={Boolean(editandoId)} onChange={(event) => cambiarTipo(event.target.value)}>
              {TIPOS_COMPONENTE.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className="form-label" htmlFor="admin-marca">Marca</label>
            <input id="admin-marca" className="form-control mb-3" value={formulario.marca} required maxLength={100} disabled={Boolean(editandoId)} onChange={(event) => setFormulario({ ...formulario, marca: event.target.value })} />
            <label className="form-label" htmlFor="admin-modelo">Modelo</label>
            <input id="admin-modelo" className="form-control mb-3" value={formulario.modelo} required maxLength={150} disabled={Boolean(editandoId)} onChange={(event) => setFormulario({ ...formulario, modelo: event.target.value })} />
            <label className="form-label" htmlFor="admin-precio">Precio base (CLP)</label>
            <input id="admin-precio" className="form-control mb-3" type="number" min="1" step="1" value={formulario.precioBase} required onChange={(event) => setFormulario({ ...formulario, precioBase: event.target.value })} />
            <label className="form-label" htmlFor="admin-descripcion">Descripción</label>
            <textarea id="admin-descripcion" className="form-control mb-3" rows="3" maxLength={500} value={formulario.descripcion} required onChange={(event) => setFormulario({ ...formulario, descripcion: event.target.value })} />
            {!editandoId && <fieldset className="border border-secondary rounded p-3 mb-3">
              <legend className="float-none w-auto px-2 fs-6 text-light">Atributos técnicos de {TIPOS_COMPONENTE.find(([tipo]) => tipo === formulario.tipo)?.[1]}</legend>
              <div className="row g-3">
                {CAMPOS_TECNICOS[formulario.tipo].map(([campo, etiqueta, tipoCampo, requerido]) => <div className="col-12 col-md-6" key={campo}>
                  <label className="form-label" htmlFor={`admin-${campo}`}>{etiqueta}</label>
                  {tipoCampo === 'boolean'
                    ? <select id={`admin-${campo}`} className="form-select" value={formulario[campo] ?? 'false'} onChange={(event) => setFormulario({ ...formulario, [campo]: event.target.value })}><option value="false">No</option><option value="true">Sí</option></select>
                    : <input id={`admin-${campo}`} className="form-control" type={tipoCampo} min={tipoCampo === 'number' ? '0' : undefined} step={tipoCampo === 'number' ? 'any' : undefined} value={formulario[campo] ?? ''} required={requerido} onChange={(event) => setFormulario({ ...formulario, [campo]: event.target.value })} />}
                </div>)}
              </div>
            </fieldset>}
            <button className="btn btn-primary-custom w-100" type="submit" disabled={guardando}>
              {guardando ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : editandoId ? 'Guardar cambios' : 'Crear componente'}
            </button>
          </form>
        </div>
      </section>

      <section className="col-12 col-xl-8" aria-labelledby="catalogo-admin-titulo">
        <div className="d-flex justify-content-between align-items-end gap-3 mb-3">
          <div><p className="auth-eyebrow mb-1">CATÁLOGO COMPLETO</p><h2 id="catalogo-admin-titulo" className="h4 mb-0">Componentes ({componentes.length})</h2></div>
          <button type="button" className="btn btn-outline-light btn-sm" disabled={cargando} onClick={() => setRecarga((actual) => actual + 1)}><i className="bi bi-arrow-clockwise me-2" />Actualizar</button>
        </div>
        <div className="row g-3">
          {componentes.map((componente) => <div className="col-12" key={componente.id}>
            <article className="card card-custom p-3 p-md-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <span className="badge text-bg-secondary mb-2">{TIPOS_UI[componente.tipo] || componente.tipo} · #{componente.id}</span>
                  <h3 className="h5 mb-1">{componente.marca} {componente.modelo}</h3>
                  <p className="text-secondary mb-2">{componente.descripcion}</p>
                  <strong className="text-success">${Number(componente.precioBase).toLocaleString('es-CL')}</strong>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className={`badge ${componente.estado === 'ACTIVO' ? 'text-bg-success' : 'text-bg-secondary'}`}>{componente.estado}</span>
                  <button type="button" className="btn btn-sm btn-outline-light" onClick={() => editar(componente)}><i className="bi bi-pencil me-1" />Editar precio</button>
                  {componente.estado === 'ACTIVO' && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => desactivar(componente)}><i className="bi bi-ban me-1" />Desactivar</button>}
                  {componente.estado !== 'ACTIVO' && <button type="button" className="btn btn-sm btn-outline-success" onClick={() => activar(componente)}><i className="bi bi-arrow-counterclockwise me-1" />Reactivar</button>}
                  {componente.estado === 'DESCONTINUADO' && <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(componente)}><i className="bi bi-trash me-1" />Eliminar definitivamente</button>}
                </div>
              </div>
            </article>
          </div>)}
          {!cargando && !error && componentes.length === 0 && <div className="col-12"><div className="card card-custom p-4 text-center text-secondary">No hay componentes registrados.</div></div>}
        </div>
      </section>
    </div>
  </main>;
}

function BandejaTecnica({ componentes }) {
  const [builds, setBuilds] = useState([]);
  const [revisadas, setRevisadas] = useState([]);
  const [observaciones, setObservaciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setCargando(true);
    setError('');
    Promise.all([
      buildsService.listarPendientesRevision({ signal: control.signal }),
      buildsService.listarRevisadas({ signal: control.signal })
    ])
      .then(([respuestaPendientes, respuestaRevisadas]) => {
        const pendientes = Array.isArray(respuestaPendientes) ? respuestaPendientes : [];
        const historial = Array.isArray(respuestaRevisadas) ? respuestaRevisadas : [];
        setBuilds(pendientes);
        setRevisadas(historial);
        setObservaciones(Object.fromEntries([...pendientes, ...historial].map((build) => [build.id, build.observacionesTecnicas || ''])));
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!control.signal.aborted) setCargando(false); });
    return () => control.abort();
  }, [recarga]);

  const componentesPorBuild = useMemo(() => componentes.reduce((indice, componente) => {
    if (componente.technicalId != null) indice.set(`${componente.tipo}:${componente.technicalId}`, componente);
    return indice;
  }, new Map()), [componentes]);

  async function revisar(build) {
    const texto = observaciones[build.id]?.trim();
    if (!texto) {
      setError('Escribe una observación antes de cerrar la revisión.');
      return;
    }
    setError('');
    setMensaje('');
    setGuardandoId(build.id);
    try {
      await buildsService.guardarObservacionesTecnicas(build.id, texto);
      setBuilds((actuales) => actuales.filter((item) => item.id !== build.id));
      setRecarga((actual) => actual + 1);
      setMensaje(`La revisión de la build #${build.id} quedó registrada.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  }

  async function actualizarRevision(build) {
    const texto = observaciones[build.id]?.trim();
    if (!texto) {
      setError('La observación no puede quedar vacía. Usa Eliminar revisión para quitarla.');
      return;
    }
    setError('');
    setMensaje('');
    setGuardandoId(build.id);
    try {
      const actualizada = await buildsService.guardarObservacionesTecnicas(build.id, texto);
      setRevisadas((actuales) => actuales.map((item) => item.id === build.id ? { ...item, ...actualizada } : item));
      setMensaje(`La revisión de la build #${build.id} fue actualizada.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  }

  async function eliminarRevision(build) {
    if (!window.confirm(`¿Eliminar la revisión de la build #${build.id}? La build volverá a la bandeja de pendientes.`)) return;
    setError('');
    setMensaje('');
    setGuardandoId(build.id);
    try {
      await buildsService.eliminarObservacionesTecnicas(build.id);
      setRevisadas((actuales) => actuales.filter((item) => item.id !== build.id));
      setObservaciones((actuales) => ({ ...actuales, [build.id]: '' }));
      setRecarga((actual) => actual + 1);
      setMensaje(`La revisión de la build #${build.id} fue eliminada y volvió a pendientes.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  }

  return <main className="container py-5">
    <header className="mb-4">
      <p className="auth-eyebrow mb-2">REVISIÓN DE CONFIGURACIONES</p>
      <h1 className="text-light fw-bold mb-1">Bandeja técnica</h1>
      <p className="text-secondary mb-0">Revisa builds pendientes y deja observaciones para el usuario.</p>
    </header>
    {mensaje && <div className="alert alert-success" role="status"><i className="bi bi-check-circle me-2" />{mensaje}</div>}
    <EstadoCarga cargando={cargando} error={error && !builds.length ? error : ''} onReintentar={() => setRecarga((actual) => actual + 1)} />
    {error && builds.length > 0 && <div className="alert alert-danger" role="alert">{error}</div>}
    {!cargando && !error && builds.length === 0 && <section className="card card-custom p-5 text-center"><i className="bi bi-clipboard-check display-4 text-info mb-3" aria-hidden="true" /><h2 className="h3">No hay builds pendientes</h2><p className="text-secondary mb-0">Las nuevas configuraciones aparecerán aquí para su revisión.</p></section>}
    <section className="row g-4" aria-label="Builds pendientes de revisión">
      {builds.map((build) => {
        const relaciones = [['CPU', 'cpuId'], ['GPU', 'gpuId'], ['Placa', 'motherboardId'], ['RAM', 'ramId'], ['Fuente', 'fuenteId']];
        return <div className="col-12 col-xl-6" key={build.id}>
          <article className="card card-custom h-100 p-4">
            <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
              <div><span className="badge text-bg-secondary mb-2">Build #{build.id}</span><h2 className="h5 mb-1">Usuario #{build.usuarioId}</h2><time className="small text-secondary" dateTime={build.fechaCreacion || undefined}>Creada: {fechaLegible(build.fechaCreacion)}</time></div>
              <span className={`badge ${build.estado === 'VALIDADA' ? 'text-bg-success' : build.estado === 'INCOMPATIBLE' ? 'text-bg-danger' : 'text-bg-warning'}`}>{build.estado || 'BORRADOR'}</span>
            </div>
            <ul className="list-unstyled mb-3">
              {relaciones.map(([tipo, campo]) => {
                const tipoCatalogo = TIPOS_UI[tipo] || tipo;
                const componente = componentesPorBuild.get(`${tipoCatalogo}:${build[campo]}`);
                return <li className="d-flex justify-content-between gap-3 border-bottom border-secondary py-2" key={campo}><span className="text-secondary">{tipo}</span><span className="text-end">{componente?.modelo || `Componente #${build[campo]}`}</span></li>;
              })}
            </ul>
            <label className="form-label" htmlFor={`observacion-${build.id}`}>Observación técnica</label>
            <textarea id={`observacion-${build.id}`} className="form-control mb-3" rows="3" maxLength="2000" placeholder="Describe el ajuste o recomendación para esta configuración." value={observaciones[build.id] || ''} onChange={(event) => setObservaciones((actuales) => ({ ...actuales, [build.id]: event.target.value }))} />
            <button type="button" className="btn btn-primary-custom mt-auto" disabled={guardandoId != null || !observaciones[build.id]?.trim()} onClick={() => revisar(build)}>
              {guardandoId === build.id ? <><span className="spinner-border spinner-border-sm me-2" />Guardando revisión...</> : <><i className="bi bi-send-check me-2" />Guardar observación y cerrar revisión</>}
            </button>
          </article>
        </div>;
      })}
    </section>
    <section className="mt-5" aria-labelledby="historial-revisiones-titulo">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div><p className="auth-eyebrow mb-1">HISTORIAL</p><h2 id="historial-revisiones-titulo" className="h3 text-light mb-0">Builds revisadas ({revisadas.length})</h2></div>
      </div>
      {!cargando && revisadas.length === 0 && <div className="card card-custom p-4 text-center text-secondary">Todavía no hay revisiones técnicas registradas.</div>}
      <div className="row g-4">
        {revisadas.map((build) => <div className="col-12 col-xl-6" key={build.id}>
          <article className="card card-custom h-100 p-4">
            <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
              <div><span className="badge text-bg-secondary mb-2">Build #{build.id}</span><h3 className="h5 mb-1">Usuario #{build.usuarioId}</h3><time className="small text-secondary" dateTime={build.fechaActualizacion || undefined}>Revisada: {fechaLegible(build.fechaActualizacion)}</time></div>
              <span className="badge text-bg-success">Revisada</span>
            </div>
            <ul className="list-unstyled mb-3">
              {[['CPU', 'cpuId'], ['GPU', 'gpuId'], ['Placa', 'motherboardId'], ['RAM', 'ramId'], ['Fuente', 'fuenteId']].map(([tipo, campo]) => {
                const tipoCatalogo = TIPOS_UI[tipo] || tipo;
                const componente = componentesPorBuild.get(`${tipoCatalogo}:${build[campo]}`);
                return <li className="d-flex justify-content-between gap-3 border-bottom border-secondary py-2" key={campo}><span className="text-secondary">{tipo}</span><span className="text-end">{componente?.modelo || `Componente #${build[campo]}`}</span></li>;
              })}
            </ul>
            <label className="form-label" htmlFor={`revision-${build.id}`}>Observación para el cliente</label>
            <textarea id={`revision-${build.id}`} className="form-control mb-3" rows="3" maxLength="2000" value={observaciones[build.id] || ''} onChange={(event) => setObservaciones((actuales) => ({ ...actuales, [build.id]: event.target.value }))} />
            <div className="d-flex flex-wrap gap-2 mt-auto">
              <button type="button" className="btn btn-primary-custom" disabled={guardandoId != null || !observaciones[build.id]?.trim()} onClick={() => actualizarRevision(build)}><i className="bi bi-save me-2" />Guardar cambios</button>
              <button type="button" className="btn btn-outline-danger" disabled={guardandoId != null} onClick={() => eliminarRevision(build)}><i className="bi bi-trash me-2" />Eliminar revisión</button>
            </div>
          </article>
        </div>)}
      </div>
    </section>
  </main>;
}

export default function PanelOperacionesView({ sesion, componentes, onCatalogoActualizado }) {
  const rol = obtenerRolSesion(sesion);
  if (rol === 'ADMINISTRADOR') return <PanelAdministrador onCatalogoActualizado={onCatalogoActualizado} />;
  if (rol === 'TECNICO') return <BandejaTecnica componentes={componentes} />;
  return <main className="container py-5"><div className="alert alert-danger" role="alert"><i className="bi bi-lock me-2" />No tienes permisos para acceder a este panel.</div></main>;
}
