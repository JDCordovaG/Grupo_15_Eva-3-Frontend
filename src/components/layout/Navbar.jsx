import React from 'react';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export default function Navbar({ vistaActual, cambiarVista, sesion, alCerrarSesion, totalCarrito = 0 }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark-custom border-bottom border-secondary sticky-top px-3">
      <div className="container-fluid">
        <a className="navbar-brand text-success fw-bold fs-4" href="#" onClick={() => cambiarVista('inicio')}>
          <i className="bi bi-cpu me-2"></i>BuildMyPC
        </a>
        <div className="navbar-nav me-auto flex-row gap-3">
          <button className={`btn btn-link nav-link ${vistaActual === 'inicio' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('inicio')}>Inicio</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'catalogo' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('catalogo')}>Catálogo</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'armador' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('armador')}>Armador</button>
          <button className={`btn btn-link nav-link ${vistaActual === 'categorias' ? 'active fw-bold' : ''}`} onClick={() => cambiarVista('categorias')}>Categorías</button>
        </div>
        <div className="navbar-nav ms-auto flex-row align-items-center gap-2">
          {sesion ? <>
            <span className="navbar-text small d-none d-md-inline"><i className="bi bi-person-circle me-2" />{sesion.email}</span>
            <button className="btn btn-sm btn-outline-light" onClick={alCerrarSesion}>Cerrar sesión</button>
          </> : <button className="btn btn-sm btn-primary-custom px-3" onClick={() => cambiarVista('autenticacion')}><i className="bi bi-person me-1" />Ingresar</button>}
        </div>
      </div>
    </nav>
  );
}
