import { useState } from 'react';

export default function AutenticacionView({ alIniciarSesion, alVolver, avisoSesionExpirada, alCerrarAvisoSesionExpirada }) {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviarFormulario(event) {
    event.preventDefault();
    setError('');
    setMensaje('');
    if (modoRegistro && password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await alIniciarSesion({ email: email.trim(), password, modoRegistro });
      if (modoRegistro) {
        setEmail('');
        setPassword('');
        setConfirmacion('');
        setModoRegistro(false);
        setMensaje('Tu cuenta fue creada. Ya puedes iniciar sesión.');
      }
    } catch (err) {
      setError(err.message || 'No fue posible completar la autenticación.');
    } finally {
      setCargando(false);
    }
  }

  function cambiarModo(registro) {
    setModoRegistro(registro);
    setEmail('');
    setPassword('');
    setConfirmacion('');
    setError('');
    setMensaje('');
  }

  return (
    <main className="auth-page container py-5">
      <div className="auth-layout">
        <section className="auth-intro">
          <div className="auth-mark"><i className="bi bi-cpu-fill" /></div>
          <p className="auth-eyebrow">TU ESPACIO BUILDMyPC</p>
          <h1>Arma, guarda<br />y mejora tu PC.</h1>
          <p className="auth-intro-copy">Inicia sesión para guardar tus configuraciones y tener tus builds siempre a mano.</p>
          <div className="auth-benefits">
            <span><i className="bi bi-check-circle-fill" /> Tus builds en un solo lugar</span>
            <span><i className="bi bi-check-circle-fill" /> Acceso seguro con tu cuenta</span>
          </div>
        </section>

        <section className="auth-card card-custom">
          <button type="button" className="auth-back btn btn-link" onClick={alVolver}>
            <i className="bi bi-arrow-left me-2" />Volver a BuildMyPC
          </button>
          <div className="auth-card-content">
            <p className="auth-eyebrow">{modoRegistro ? 'EMPIEZA HOY' : 'QUÉ BUENO VERTE'}</p>
            <h2>{modoRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}</h2>
            <p className="auth-subtitle">{modoRegistro ? 'Completa tus datos para continuar.' : 'Ingresa tus datos para acceder a tus builds.'}</p>

            <div className="auth-tabs" role="tablist" aria-label="Acceso a la cuenta">
              <button type="button" role="tab" aria-selected={!modoRegistro} className={!modoRegistro ? 'selected' : ''} onClick={() => cambiarModo(false)}>Iniciar sesión</button>
              <button type="button" role="tab" aria-selected={modoRegistro} className={modoRegistro ? 'selected' : ''} onClick={() => cambiarModo(true)}>Crear cuenta</button>
            </div>

            <form onSubmit={enviarFormulario}>
              <label className="auth-label" htmlFor="auth-email">Correo electrónico</label>
              <div className="auth-input-wrap"><i className="bi bi-envelope" /><input id="auth-email" type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>

              <label className="auth-label mt-3" htmlFor="auth-password">Contraseña</label>
              <div className="auth-input-wrap"><i className="bi bi-lock" /><input id="auth-password" type="password" autoComplete={modoRegistro ? 'new-password' : 'current-password'} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></div>

              {modoRegistro && <>
                <label className="auth-label mt-3" htmlFor="auth-confirm">Confirma tu contraseña</label>
                <div className="auth-input-wrap"><i className="bi bi-shield-lock" /><input id="auth-confirm" type="password" autoComplete="new-password" placeholder="Repite tu contraseña" value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} minLength={6} required /></div>
              </>}

              {error && <div className="auth-alert auth-alert-error" role="alert"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              {mensaje && <div className="auth-alert auth-alert-success" role="status"><i className="bi bi-check-circle me-2" />{mensaje}</div>}
              <button className="auth-submit" type="submit" disabled={cargando}>
                {cargando ? <><span className="spinner-border spinner-border-sm me-2" />Procesando...</> : <>{modoRegistro ? 'Crear cuenta' : 'Entrar'}<i className="bi bi-arrow-right ms-2" /></>}
              </button>
            </form>
            <p className="auth-terms">Al continuar, aceptas nuestros términos de servicio y política de privacidad.</p>
          </div>
          {avisoSesionExpirada && <div className="alert alert-warning position-relative mx-4 mb-4 pe-5" role="status">
            <span>Su sesión ha finalizado por seguridad. ¡Por favor, ingrese nuevamente!</span>
            <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Cerrar aviso de sesión expirada" onClick={alCerrarAvisoSesionExpirada} />
          </div>}
        </section>
      </div>
    </main>
  );
}
