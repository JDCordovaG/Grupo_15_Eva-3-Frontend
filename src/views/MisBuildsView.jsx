import { useEffect, useMemo, useState } from 'react';
import { buildsService } from '../services/buildsService';
import { calcularSubtotal } from '../utils/reglasCompatibilidad';

const relaciones = [
  ['CPU', 'cpuId'], ['GPU', 'gpuId'], ['Placa', 'motherboardId'], ['RAM', 'ramId'], ['Fuente', 'fuenteId']
];

export default function MisBuildsView({ usuarioId, componentes, alEditar, alCrearBuild }) {
  const [builds, setBuilds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    const control = new AbortController();
    if (!usuarioId) {
      setCargando(false);
      return () => control.abort();
    }

    setCargando(true);
    setError('');
    buildsService.listarPorUsuario(usuarioId, { signal: control.signal })
      .then((respuesta) => setBuilds(Array.isArray(respuesta) ? respuesta : []))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!control.signal.aborted) setCargando(false); });

    return () => control.abort();
  }, [usuarioId]);

  const componentesPorBuild = useMemo(() => componentes.reduce((indice, componente) => {
    if (componente.technicalId != null) indice.set(`${componente.tipo}:${componente.technicalId}`, componente);
    return indice;
  }, new Map()), [componentes]);

  async function eliminar(build) {
    setEliminando(build.id);
    setError('');
    try {
      await buildsService.eliminar(build.id);
      setBuilds((actuales) => actuales.filter((item) => item.id !== build.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(null);
    }
  }

  return (
    <main className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div><p className="auth-eyebrow mb-2">TU COLECCIÓN</p><h1 className="text-light fw-bold mb-1">Mis builds</h1><p className="text-secondary mb-0">Tus configuraciones guardadas en BuildMyPC.</p></div>
        <button className="btn btn-primary-custom px-4" onClick={alCrearBuild}><i className="bi bi-plus-lg me-2" />Crear una build</button>
      </div>

      {!usuarioId && <div className="alert alert-warning">No encontramos el identificador numérico de tu usuario en la sesión. El endpoint de login debe devolverlo dentro de <code>usuario.id</code> para guardar y listar tus builds.</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {cargando && <div className="alert alert-info"><span className="spinner-border spinner-border-sm me-2" />Cargando tus builds...</div>}
      {!cargando && usuarioId && !error && builds.length === 0 && <div className="card card-custom p-5 text-center"><i className="bi bi-pc-display display-4 text-info mb-3" /><h3>Aún no guardas una build</h3><p className="text-secondary">Arma tu PC y guárdala para volver a editarla cuando quieras.</p><button className="btn btn-primary-custom mx-auto px-4" onClick={alCrearBuild}>Ir al armador</button></div>}

      <div className="row g-4">
        {builds.map((build) => {
          const seleccion = Object.fromEntries(relaciones.map(([tipo, campo]) => [tipo, componentesPorBuild.get(`${tipo}:${build[campo]}`) || null]));
          const precio = calcularSubtotal(seleccion);
          return <div className="col-12 col-lg-6" key={build.id}>
            <article className="card card-custom h-100 p-4">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-3"><div><span className="badge text-bg-secondary mb-2">Build #{build.id}</span><h3 className="h5 mb-0">Configuración personalizada</h3></div><span className={`badge ${build.estado === 'VALIDADA' ? 'text-bg-success' : build.estado === 'INCOMPATIBLE' ? 'text-bg-danger' : 'text-bg-warning'}`}>{build.estado || 'BORRADOR'}</span></div>
              <ul className="list-unstyled mb-3">
                {relaciones.map(([tipo]) => <li className="d-flex justify-content-between border-bottom border-secondary py-2" key={tipo}><span className="text-secondary">{tipo}</span><span className="text-end">{seleccion[tipo]?.modelo || `Componente #${build[relaciones.find(([nombre]) => nombre === tipo)?.[1]]}`}</span></li>)}
              </ul>
              <div className="d-flex justify-content-between align-items-center mb-3"><span className="text-secondary">Total estimado</span><strong className="text-success fs-5">${precio.toLocaleString('es-CL')}</strong></div>
              <div className="d-flex gap-2 mt-auto"><button className="btn btn-outline-light flex-grow-1" onClick={() => alEditar(build, seleccion)}><i className="bi bi-pencil me-2" />Editar en armador</button>{build.estado === 'BORRADOR' && <button className="btn btn-outline-danger" aria-label={`Eliminar build ${build.id}`} disabled={eliminando === build.id} onClick={() => eliminar(build)}>{eliminando === build.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-trash" />}</button>}</div>
            </article>
          </div>;
        })}
      </div>
    </main>
  );
}
