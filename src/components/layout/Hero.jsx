export default function Hero({ alIrAlArmador, alIrAlCatalogo }) {
  return (
    <section className="home-hero card-custom">
      <div className="home-hero-copy">
        <span className="home-hero-eyebrow"><i className="bi bi-stars me-2" />TU PRÓXIMA BUILD EMPIEZA AQUÍ</span>
        <h1>Arma una PC que esté hecha <span>para ti.</span></h1>
        <p>Elige cada componente, comprueba su compatibilidad y guarda una configuración lista para cotizar.</p>
        <div className="d-flex flex-wrap gap-3">
          <button className="btn btn-primary-custom btn-lg px-4 py-3" onClick={alIrAlArmador}>
            Crear mi build <i className="bi bi-arrow-right ms-2" />
          </button>
          <button className="btn btn-outline-light btn-lg px-4 py-3" onClick={alIrAlCatalogo}>
            Explorar componentes
          </button>
        </div>
        <div className="home-hero-trust"><span><i className="bi bi-check-circle-fill" /> Compatibilidad validada</span><span><i className="bi bi-lightning-charge-fill" /> Consumo calculado</span></div>
      </div>
      <div className="home-hero-visual" aria-hidden="true">
        <div className="home-orbit home-orbit-one" />
        <div className="home-orbit home-orbit-two" />
        <div className="home-chip"><i className="bi bi-cpu-fill" /><span>BUILD<br />YOUR PC</span></div>
        <div className="home-floating-card home-floating-cpu"><i className="bi bi-cpu" /><span>Procesador</span><strong>Elige tu potencia</strong></div>
        <div className="home-floating-card home-floating-gpu"><i className="bi bi-gpu-card" /><span>Gráficos</span><strong>Juega a tu manera</strong></div>
        <div className="home-visual-caption">Tu idea. Tus piezas. Tu PC.</div>
      </div>
    </section>
  );
}
