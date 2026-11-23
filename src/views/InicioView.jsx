import Hero from '../components/layout/Hero';
import ComponentesDestacados from '../components/layout/ComponentesDestacados';
import Footer from '../components/layout/Footer';

export default function InicioView({ alNavegar, componentes, cargando }) {
  return (
    <div className="container py-4 home-page">
      <Hero alIrAlArmador={() => alNavegar('armador')} alIrAlCatalogo={() => alNavegar('catalogo')} />
      <ComponentesDestacados componentes={componentes} cargando={cargando} alExplorarCatalogo={() => alNavegar('catalogo')} />

      <section className="home-how-it-works" aria-labelledby="como-funciona-titulo">
        <div className="home-section-heading home-section-heading-centered">
          <div>
            <span className="home-section-eyebrow">FÁCIL DE PRINCIPIO A FIN</span>
            <h2 id="como-funciona-titulo">Tu PC, en tres pasos</h2>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-4"><article className="home-step-card h-100"><span className="home-step-number">01</span><i className="bi bi-motherboard" /><h3>Elige tus piezas</h3><p>Explora el catálogo y agrega los componentes que mejor se ajustan a tu idea.</p></article></div>
          <div className="col-12 col-md-4"><article className="home-step-card h-100"><span className="home-step-number">02</span><i className="bi bi-check2-circle" /><h3>Revisa compatibilidad</h3><p>Comprueba sockets, memoria y consumo antes de guardar tu configuración.</p></article></div>
          <div className="col-12 col-md-4"><article className="home-step-card h-100"><span className="home-step-number">03</span><i className="bi bi-bookmark-check" /><h3>Guarda y cotiza</h3><p>Conserva tus builds y consulta el resumen de cada configuración cuando quieras.</p></article></div>
        </div>
      </section>

      <section className="home-video-section" aria-labelledby="video-titulo">
        <div className="home-section-heading">
          <div><span className="home-section-eyebrow">APRENDE A TU RITMO</span><h2 id="video-titulo">¿Primera vez armando un PC?</h2><p>Una guía visual para conocer el proceso de ensamblaje.</p></div>
        </div>
        <div className="home-video-frame">
          <iframe src="https://www.youtube.com/embed/uUGI3Grx4qU" title="Guía de ensamblaje de PC" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        </div>
      </section>

      <div className="home-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}
