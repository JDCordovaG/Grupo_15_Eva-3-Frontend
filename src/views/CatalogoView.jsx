import { useState } from 'react';
import FiltroCatalogo from '../components/catalogo/FiltroCatalogo';
import TarjetaComponente from '../components/catalogo/TarjetaComponente';

export default function CatalogoView({ componentes, cargando, error, alReintentar, alSeleccionarComponente, alVerDetalle }) {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const componentesFiltrados = componentes.filter(comp => {
    const coincideTipo = filtroTipo === '' || comp.tipo === filtroTipo;
    const coincideBusqueda = comp.modelo.toLowerCase().includes(busqueda.toLowerCase().trim()) || 
                             comp.marca.toLowerCase().includes(busqueda.toLowerCase().trim());
    return coincideTipo && coincideBusqueda;
  });

  return (
    <div className="container py-4">
      <h2 className="text-light mb-4"><i className="bi bi-grid me-2"></i>Catálogo General de Componentes</h2>
      <FiltroCatalogo 
        filtroTipo={filtroTipo} 
        setFiltroTipo={setFiltroTipo} 
        busqueda={busqueda} 
        setBusqueda={setBusqueda} 
      />
      {cargando && <div className="alert alert-info" role="status"><span className="spinner-border spinner-border-sm me-2" />Conectando con el catálogo del Backend...</div>}
      {error && <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3" role="alert"><span><i className="bi bi-exclamation-triangle me-2" />{error}</span><button className="btn btn-sm btn-outline-light text-nowrap" onClick={alReintentar}>Reintentar</button></div>}
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {componentesFiltrados.map(comp => (
          <div key={comp.id} className="col">
            <div onClick={() => alVerDetalle(comp)} style={{ cursor: 'pointer' }}>
              <TarjetaComponente componente={comp} alSeleccionar={() => alSeleccionarComponente(comp)} />
            </div>
          </div>
        ))}
      </div>
      {!cargando && !error && componentesFiltrados.length === 0 && <div className="card card-custom p-5 text-center mt-3"><i className="bi bi-box-seam display-5 text-info mb-3" /><h4>No hay componentes para mostrar</h4><p className="mb-0 text-secondary">El catálogo del Backend no contiene registros activos para estos filtros.</p></div>}
    </div>
  );
}
