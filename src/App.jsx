import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import InicioView from './views/InicioView';
import CatalogoView from './views/CatalogoView';
import ArmadorView from './views/ArmadorView';
import ResultadoView from './views/ResultadoView';
import CotizacionView from './views/CotizacionView';
import DetalleComponenteView from './views/DetalleComponenteView';
import CategoriasView from './views/CategoriasView';
import AutenticacionView from './views/AutenticacionView';
import { authService } from './services/authService';
import { persistenciaService } from './services/persistenciaService';
import { componentesService } from './services/componentesService';
import { calcularSubtotal } from './utils/reglasCompatibilidad';
import './App.css';

export default function App() {
  const [vista, setVista] = useState('inicio');
  const [componentes, setComponentes] = useState([]);
  const [cargandoComponentes, setCargandoComponentes] = useState(false);
  const [errorComponentes, setErrorComponentes] = useState('');
  const [recargaCatalogo, setRecargaCatalogo] = useState(0);
  const [build, setBuild] = useState({ CPU: null, GPU: null, Placa: null, RAM: null, Fuente: null });
  const [componenteSeleccionado, setComponenteSeleccionado] = useState(null);
  const [sesion, setSesion] = useState(() => authService.obtenerSesion());

  useEffect(() => {
    setBuild(persistenciaService.obtenerBuildActual());
  }, []);

  useEffect(() => {
    if (!sesion) {
      setComponentes([]);
      return undefined;
    }

    const control = new AbortController();
    setCargandoComponentes(true);
    setErrorComponentes('');
    componentesService.listar({ signal: control.signal })
      .then(setComponentes)
      .catch((error) => {
        if (error.name !== 'AbortError') setErrorComponentes(error.message);
      })
      .finally(() => {
        if (!control.signal.aborted) setCargandoComponentes(false);
      });

    return () => control.abort();
  }, [sesion, recargaCatalogo]);

  const handleSeleccionarComponenteBuild = (tipo, componente) => {
    const nuevaBuild = { ...build, [tipo]: componente };
    setBuild(nuevaBuild);
    persistenciaService.guardarBuildActual(nuevaBuild);
  };

  const handleVerDetalle = (comp) => {
    setComponenteSeleccionado(comp);
    setVista('detalle');
  };

  const handleAutenticacion = async ({ email, password, modoRegistro }) => {
    if (modoRegistro) {
      await authService.registrar({ email, password });
      throw new Error('Cuenta creada. El inicio de sesión JWT aún no está disponible en el Backend.');
    }
    const nuevaSesion = await authService.iniciarSesion(email, password);
    setSesion(nuevaSesion);
    setVista('inicio');
  };

  const handleCerrarSesion = () => {
    authService.cerrarSesion();
    setSesion(null);
    setVista('inicio');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar vistaActual={vista} cambiarVista={setVista} sesion={sesion} alCerrarSesion={handleCerrarSesion} totalCarrito={calcularSubtotal(build)} />
      
      <div className="flex-grow-1">
        {vista === 'inicio' && <InicioView alNavegar={setVista} />}
        {vista === 'catalogo' && (
          <CatalogoView 
            componentes={componentes} 
            cargando={cargandoComponentes}
            error={errorComponentes}
            alReintentar={() => setRecargaCatalogo((actual) => actual + 1)}
            alSeleccionarComponente={(c) => handleSeleccionarComponenteBuild(c.tipo, c)} 
            alVerDetalle={handleVerDetalle}
          />
        )}
        {vista === 'categorias' && (
          <CategoriasView alSeleccionarCategoria={(cat) => setVista('catalogo')} />
        )}
        {vista === 'detalle' && (
          <DetalleComponenteView 
            componente={componenteSeleccionado} 
            alVolver={() => setVista('catalogo')}
            alAgregar={(c) => {
              handleSeleccionarComponenteBuild(c.tipo, c);
              setVista('armador');
            }}
          />
        )}
        {vista === 'armador' && (
          <ArmadorView 
            componentes={componentes} 
            build={build} 
            alSeleccionar={handleSeleccionarComponenteBuild}
            alVerCompatibilidad={() => setVista('resultado')}
          />
        )}
        {vista === 'resultado' && (
          <ResultadoView build={build} alIrACotizar={() => setVista('cotizacion')} />
        )}
        {vista === 'cotizacion' && <CotizacionView build={build} />}
        {vista === 'autenticacion' && <AutenticacionView alIniciarSesion={handleAutenticacion} alVolver={() => setVista('inicio')} />}
      </div>
    </div>
  );
}
