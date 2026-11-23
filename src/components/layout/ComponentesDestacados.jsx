import { useEffect, useMemo, useState } from 'react';

const TAMANO_PAGINA = 3;

export default function ComponentesDestacados({ componentes = [], cargando = false, alExplorarCatalogo }) {
  const paginas = useMemo(() => {
    const destacados = componentes.slice(0, 9);
    const resultado = [];
    for (let inicio = 0; inicio < destacados.length; inicio += TAMANO_PAGINA) {
      resultado.push(destacados.slice(inicio, inicio + TAMANO_PAGINA));
    }
    return resultado;
  }, [componentes]);
  const [paginaActual, setPaginaActual] = useState(0);

  useEffect(() => {
    setPaginaActual(0);
  }, [componentes]);

  function cambiarPagina(direccion) {
    setPaginaActual((actual) => (actual + direccion + paginas.length) % paginas.length);
  }

  return (
    <section className="home-featured" aria-labelledby="destacados-titulo">
      <div className="home-section-heading">
        <div>
          <span className="home-section-eyebrow">PIEZAS PARA TU PRÓXIMA BUILD</span>
          <h2 id="destacados-titulo">Conoce lo que puedes combinar</h2>
          <p>Una selección del catálogo para inspirar tu próxima configuración.</p>
        </div>
        <button type="button" className="btn btn-outline-light" onClick={alExplorarCatalogo}>
          Ver catálogo completo <i className="bi bi-arrow-up-right ms-2" />
        </button>
      </div>

      {cargando && <div className="row g-3" aria-label="Cargando componentes destacados">
        {[1, 2, 3].map((item) => <div className="col-12 col-md-4" key={item}><div className="home-component-card home-component-skeleton"><span className="spinner-border spinner-border-sm text-info" />Cargando componente...</div></div>)}
      </div>}

      {!cargando && paginas.length > 0 && <div className="home-carousel" aria-roledescription="carrusel" aria-label="Componentes destacados del catálogo">
        <div className="row g-3" aria-live="polite">
          {paginas[paginaActual].map((componente) => <div className="col-12 col-md-4" key={componente.id}>
            <article className="home-component-card h-100">
              <div className="home-component-image-wrap">
                <img src={componente.imagen} alt={componente.modelo} loading="lazy" />
                <span className="home-component-type">{componente.tipo}</span>
              </div>
              <div className="home-component-copy">
                <p className="home-component-brand">{componente.marca}</p>
                <h3>{componente.modelo}</h3>
                <p className="home-component-description">{componente.descripcion || 'Una pieza seleccionada para formar parte de tu próxima configuración.'}</p>
              </div>
            </article>
          </div>)}
        </div>
        {paginas.length > 1 && <div className="home-carousel-controls">
          <button type="button" className="home-carousel-arrow" aria-label="Componentes anteriores" onClick={() => cambiarPagina(-1)}><i className="bi bi-arrow-left" /></button>
          <div className="home-carousel-dots" role="group" aria-label="Elegir página de componentes">
            {paginas.map((_, indice) => <button type="button" key={indice} className={indice === paginaActual ? 'active' : ''} aria-label={`Mostrar página ${indice + 1}`} aria-current={indice === paginaActual ? 'true' : undefined} onClick={() => setPaginaActual(indice)} />)}
          </div>
          <span className="home-carousel-count">{paginaActual + 1} / {paginas.length}</span>
          <button type="button" className="home-carousel-arrow" aria-label="Siguientes componentes" onClick={() => cambiarPagina(1)}><i className="bi bi-arrow-right" /></button>
        </div>}
      </div>}

      {!cargando && paginas.length === 0 && <div className="home-featured-empty"><i className="bi bi-box-seam" /><span>Los componentes destacados aparecerán aquí cuando el catálogo esté disponible.</span></div>}
    </section>
  );
}
