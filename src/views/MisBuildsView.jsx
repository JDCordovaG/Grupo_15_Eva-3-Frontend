import { useEffect, useMemo, useState } from 'react';
import { buildsService } from '../services/buildsService';
import { calcularSubtotal } from '../utils/reglasCompatibilidad';

const relaciones = [
  ['CPU', 'cpuId'],
  ['GPU', 'gpuId'],
  ['Placa', 'motherboardId'],
  ['RAM', 'ramId'],
  ['Fuente', 'fuenteId']
];

const estadoVisual = {
  BORRADOR: { clase: 'text-bg-warning', icono: 'bi-pencil-square', etiqueta: 'Borrador' },
  VALIDADA: { clase: 'text-bg-success', icono: 'bi-check-circle', etiqueta: 'Validada' },
  INCOMPATIBLE: { clase: 'text-bg-danger', icono: 'bi-exclamation-triangle', etiqueta: 'Incompatible' },
  ARCHIVADA: { clase: 'text-bg-secondary', icono: 'bi-archive', etiqueta: 'Archivada' }
};

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible';
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(valor);
}

export default function MisBuildsView({ usuarioId, componentes, alEditar, alCrearBuild }) {
  const [builds, setBuilds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizacion, setActualizacion] = useState(0);
  const [accionEnCurso, setAccionEnCurso] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const control = new AbortController();
    setBuilds([]);
    setError('');
    setMensaje('');

    if (!usuarioId) {
      setCargando(false);
      return () => control.abort();
    }

    setCargando(true);
    buildsService.listarPorUsuario(usuarioId, { signal: control.signal })
      .then((respuesta) => setBuilds(Array.isArray(respuesta) ? respuesta : []))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!control.signal.aborted) setCargando(false); });

    return () => control.abort();
  }, [usuarioId, actualizacion]);

  const componentesPorBuild = useMemo(() => componentes.reduce((indice, componente) => {
    if (componente.technicalId != null) indice.set(`${componente.tipo}:${componente.technicalId}`, componente);
    return indice;
  }, new Map()), [componentes]);

  async function duplicar(build) {
    setAccionEnCurso({ tipo: 'duplicar', id: build.id });
    setError('');
    setMensaje('');
    const nuevaBuild = {
      usuarioId: build.usuarioId ?? Number(usuarioId),
      cpuId: build.cpuId,
      gpuId: build.gpuId,
      motherboardId: build.motherboardId,
      ramId: build.ramId,
      fuenteId: build.fuenteId
    };

    try {
      const creada = await buildsService.crear(nuevaBuild);
      if (creada?.id != null) setBuilds((actuales) => [creada, ...actuales]);
      else setActualizacion((valor) => valor + 1);
      setMensaje(`Se creó una copia de la build #${build.id}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function archivar(build) {
    setAccionEnCurso({ tipo: 'archivar', id: build.id });
    setError('');
    setMensaje('');
    try {
      const actualizada = await buildsService.archivar(build.id);
      setBuilds((actuales) => actuales.map((item) => item.id === build.id
        ? { ...item, ...actualizada, estado: actualizada?.estado || 'ARCHIVADA' }
        : item));
      setMensaje(`La build #${build.id} quedó archivada.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function desarchivar(build) {
    setAccionEnCurso({ tipo: 'desarchivar', id: build.id });
    setError('');
    setMensaje('');
    try {
      const actualizada = await buildsService.desarchivar(build.id);
      setBuilds((actuales) => actuales.map((item) => item.id === build.id
        ? { ...item, ...actualizada, estado: actualizada?.estado || 'BORRADOR' }
        : item));
      setMensaje(`La build #${build.id} volvió a tus borradores.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function eliminar(build) {
    const confirmado = window.confirm(`¿Eliminar definitivamente la build #${build.id}?`);
    if (!confirmado) return;

    setAccionEnCurso({ tipo: 'eliminar', id: build.id });
    setError('');
    setMensaje('');
    try {
      await buildsService.eliminar(build.id);
      setBuilds((actuales) => actuales.filter((item) => item.id !== build.id));
      setMensaje(`La build #${build.id} fue eliminada.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccionEnCurso(null);
    }
  }

  return (
    <main className="container py-5">
      <header className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <p className="auth-eyebrow mb-2">TU COLECCIÓN</p>
          <h1 className="text-light fw-bold mb-1">Mis builds</h1>
          <p className="text-secondary mb-0">Consulta, continúa y organiza tus configuraciones guardadas.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" type="button" aria-label="Actualizar builds" disabled={cargando || !usuarioId} onClick={() => setActualizacion((valor) => valor + 1)}>
            <i className={`bi ${cargando ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} me-2`} />Actualizar
          </button>
          <button className="btn btn-primary-custom px-4" type="button" onClick={alCrearBuild}>
            <i className="bi bi-plus-lg me-2" />Crear una build
          </button>
        </div>
      </header>

      {!usuarioId && <div className="alert alert-warning" role="alert"><i className="bi bi-person-exclamation me-2" />No pudimos identificar tu cuenta para cargar tus builds. Cierra sesión e inicia sesión nuevamente.</div>}
      {error && <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert"><span><i className="bi bi-exclamation-circle me-2" />{error}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setActualizacion((valor) => valor + 1)}>Reintentar</button></div>}
      {mensaje && <div className="alert alert-success" role="status"><i className="bi bi-check-circle me-2" />{mensaje}</div>}
      {cargando && <div className="alert alert-info" role="status"><span className="spinner-border spinner-border-sm me-2" />Cargando tus builds...</div>}

      {!cargando && !error && usuarioId && builds.length === 0 && (
        <section className="card card-custom p-5 text-center">
          <i className="bi bi-pc-display display-4 text-info mb-3" aria-hidden="true" />
          <h2 className="h3">Aún no guardas una build</h2>
          <p className="text-secondary">Arma tu PC y guárdala aquí para continuar cuando quieras.</p>
          <button className="btn btn-primary-custom mx-auto px-4" type="button" onClick={alCrearBuild}>Ir al armador</button>
        </section>
      )}

      {!cargando && !error && builds.length > 0 && <section aria-label="Builds guardadas">
        <p className="text-secondary mb-3">{builds.length} {builds.length === 1 ? 'configuración guardada' : 'configuraciones guardadas'}</p>
        <div className="row g-4">
          {builds.map((build) => {
            const seleccion = Object.fromEntries(relaciones.map(([tipo, campo]) => [tipo, componentesPorBuild.get(`${tipo}:${build[campo]}`) || null]));
            const precioDisponible = relaciones.every(([tipo]) => seleccion[tipo]);
            const precio = precioDisponible ? calcularSubtotal(seleccion) : null;
            const estado = estadoVisual[build.estado] || estadoVisual.BORRADOR;
            const fecha = build.fechaCreacion || build.audit?.createdAt;
            const duplicando = accionEnCurso?.tipo === 'duplicar' && accionEnCurso.id === build.id;
            const archivando = accionEnCurso?.tipo === 'archivar' && accionEnCurso.id === build.id;
            const desarchivando = accionEnCurso?.tipo === 'desarchivar' && accionEnCurso.id === build.id;
            const eliminando = accionEnCurso?.tipo === 'eliminar' && accionEnCurso.id === build.id;

            return <div className="col-12 col-lg-6" key={build.id}>
              <article className="card card-custom h-100 p-4">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div>
                    <span className="badge text-bg-secondary mb-2">Build #{build.id}</span>
                    <h2 className="h5 mb-1">Configuración personalizada</h2>
                    <time className="small text-secondary" dateTime={fecha || undefined}>Creada: {formatearFecha(fecha)}</time>
                  </div>
                  <span className={`badge ${estado.clase}`}><i className={`bi ${estado.icono} me-1`} aria-hidden="true" />{estado.etiqueta}</span>
                </div>

                <ul className="list-unstyled mb-3">
                  {relaciones.map(([tipo, campo]) => <li className="d-flex justify-content-between gap-3 border-bottom border-secondary py-2" key={tipo}>
                    <span className="text-secondary">{tipo}</span>
                    <span className="text-end">{seleccion[tipo]?.modelo || (build[campo] ? `Componente #${build[campo]}` : 'Sin componente')}</span>
                  </li>)}
                </ul>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary">Total estimado</span>
                  <strong className="text-success fs-5">{precio == null ? 'No disponible' : `$${precio.toLocaleString('es-CL')}`}</strong>
                </div>

                {!precioDisponible && <p className="small text-secondary">No se pudo asociar algún componente con el catálogo actual.</p>}
                {build.estadoRevision === 'REVISADA' && build.observacionesTecnicas && <section className="alert alert-info mt-2 mb-3" aria-label={`Revisión técnica de la build ${build.id}`}>
                  <h3 className="h6"><i className="bi bi-clipboard-check me-2" />Revisión técnica</h3>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{build.observacionesTecnicas}</p>
                  {build.fechaActualizacion && <small className="d-block mt-2">Actualizada: {formatearFecha(build.fechaActualizacion)}</small>}
                </section>}
                <div className="d-flex flex-wrap gap-2 mt-auto">
                  <button className="btn btn-outline-light flex-grow-1" type="button" disabled={Boolean(accionEnCurso)} onClick={() => alEditar(build, seleccion)}>
                    <i className="bi bi-play-circle me-2" />Continuar
                  </button>
                  <button className="btn btn-outline-info" type="button" aria-label={`Duplicar build ${build.id}`} disabled={Boolean(accionEnCurso)} onClick={() => duplicar(build)}>
                    {duplicando ? <span className="spinner-border spinner-border-sm" aria-label="Duplicando" /> : <><i className="bi bi-copy me-2" />Duplicar</>}
                  </button>
                  {build.estado !== 'ARCHIVADA' ? <button className="btn btn-outline-secondary" type="button" aria-label={`Archivar build ${build.id}`} disabled={Boolean(accionEnCurso)} onClick={() => archivar(build)}>
                    {archivando ? <span className="spinner-border spinner-border-sm" aria-label="Archivando" /> : <><i className="bi bi-archive me-2" />Archivar</>}
                  </button> : <button className="btn btn-outline-success" type="button" aria-label={`Desarchivar build ${build.id}`} disabled={Boolean(accionEnCurso)} onClick={() => desarchivar(build)}>
                    {desarchivando ? <span className="spinner-border spinner-border-sm" aria-label="Restaurando" /> : <><i className="bi bi-arrow-counterclockwise me-2" />Desarchivar</>}
                  </button>}
                  <button className="btn btn-outline-danger" type="button" aria-label={`Eliminar build ${build.id}`} disabled={Boolean(accionEnCurso)} onClick={() => eliminar(build)}>
                    {eliminando ? <span className="spinner-border spinner-border-sm" aria-label="Eliminando" /> : <><i className="bi bi-trash me-2" />Eliminar</>}
                  </button>
                </div>
              </article>
            </div>;
          })}
        </div>
      </section>}
    </main>
  );
}
