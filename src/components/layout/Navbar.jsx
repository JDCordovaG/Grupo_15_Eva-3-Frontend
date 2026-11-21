export default function Navbar({ vistaActual, cambiarVista, sesion, alCerrarSesion }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark-custom border-bottom border-secondary sticky-top px-3">
      <div className="container-fluid">
        <a className="navbar-brand text-success fw-bold fs-4" href="#" onClick={(event) => { event.preventDefault(); cambiarVista(sesion ? 'inicio' : 'autenticacion'); }}>
          <i className="bi bi-cpu me-2" />BuildMyPC
        </a>
        {sesion && <div className="navbar-nav me-auto flex-row gap-3">
          <button className={`btn btn-link nav-link ${vistaActual === 'inicio' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('inicio')}>Inicio</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'catalogo' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('catalogo')}>Catálogo</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'armador' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('armador')}>Armador</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'categorias' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('categorias')}>Categorías</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'mis-builds' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('mis-builds')}>Mis builds</button>
        </div>}
        {sesion && <div className="navbar-nav ms-auto flex-row align-items-center gap-2">
          <span className="navbar-text small d-none d-md-inline"><i className="bi bi-person-circle me-2" />{sesion.email}</span>
          <button className="btn btn-sm btn-outline-light" onClick={alCerrarSesion}>Cerrar sesión</button>
        </div>}
      </div>
    </nav>
  );
}
