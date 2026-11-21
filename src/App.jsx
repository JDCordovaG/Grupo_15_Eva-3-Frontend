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
import MisBuildsView from './views/MisBuildsView';
import { authService } from './services/authService';
import { persistenciaService } from './services/persistenciaService';
import { componentesService } from './services/componentesService';
import { buildsService } from './services/buildsService';
import { calcularSubtotal } from './utils/reglasCompatibilidad';
import './App.css';

const crearBuildVacia = () => ({ CPU: null, GPU: null, Placa: null, RAM: null, Fuente: null });

export default function App() {
  const [vista, setVista] = useState(() => authService.obtenerSesion() ? 'inicio' : 'autenticacion');
  const [componentes, setComponentes] = useState([]);
  const [cargandoComponentes, setCargandoComponentes] = useState(false);
  const [errorComponentes, setErrorComponentes] = useState('');
  const [recargaCatalogo, setRecargaCatalogo] = useState(0);
  const [build, setBuild] = useState(crearBuildVacia);
  const [componenteSeleccionado, setComponenteSeleccionado] = useState(null);
  const [sesion, setSesion] = useState(() => authService.obtenerSesion());
  const [errorGuardarBuild, setErrorGuardarBuild] = useState('');
  const [mensajeGuardarBuild, setMensajeGuardarBuild] = useState('');
  const [guardandoBuild, setGuardandoBuild] = useState(false);
  const [recargaBuilds, setRecargaBuilds] = useState(0);
  const [buildEditandoId, setBuildEditandoId] = useState(null);
  const usuarioId = authService.obtenerUsuarioId(sesion);

  const handleNavegarMenu = (vistaNueva) => {
    if (vistaNueva === vista) return;
    const buildVacia = crearBuildVacia();
    setBuild(buildVacia);
    persistenciaService.guardarBuildActual(buildVacia);
    setComponenteSeleccionado(null);
    setBuildEditandoId(null);
    setErrorGuardarBuild('');
    setMensajeGuardarBuild('');
    setVista(vistaNueva);
  };

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
    setErrorGuardarBuild('');
    setMensajeGuardarBuild('');
  };

  const handleVerDetalle = (comp) => {
    setComponenteSeleccionado(comp);
    setVista('detalle');
  };

  const handleGuardarBuild = async () => {
    if (guardandoBuild) return;
    setErrorGuardarBuild('');
    setMensajeGuardarBuild('');
    const seleccionados = [build.CPU, build.GPU, build.Placa, build.RAM, build.Fuente];
    if (!usuarioId) {
      setErrorGuardarBuild('La sesión no incluye usuario.id. El login debe devolver ese identificador para asociar la build a tu cuenta.');
      return;
    }
    if (seleccionados.some((componente) => !componente?.technicalId)) {
      setErrorGuardarBuild('Faltan datos técnicos de uno o más componentes. Revisa que cada producto tenga su registro técnico en el Backend.');
      return;
    }

    const datos = {
      usuarioId,
      cpuId: build.CPU.technicalId,
      gpuId: build.GPU.technicalId,
      motherboardId: build.Placa.technicalId,
      ramId: build.RAM.technicalId,
      fuenteId: build.Fuente.technicalId
    };

    setGuardandoBuild(true);
    try {
      const resultado = buildEditandoId
        ? await buildsService.actualizar(buildEditandoId, datos)
        : await buildsService.crear(datos);
      if (resultado?.id != null) setBuildEditandoId(resultado.id);
      setRecargaBuilds((actual) => actual + 1);
      setMensajeGuardarBuild(buildEditandoId ? 'Los cambios de la build se guardaron correctamente.' : 'La build se guardó correctamente.');
    } catch (error) {
      setErrorGuardarBuild(error.message);
    } finally {
      setGuardandoBuild(false);
    }
  };

  const handleCrearBuild = () => {
    const buildVacia = crearBuildVacia();
    setBuild(buildVacia);
    persistenciaService.guardarBuildActual(buildVacia);
    setBuildEditandoId(null);
    setErrorGuardarBuild('');
    setMensajeGuardarBuild('');
    setVista('armador');
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
    const buildVacia = crearBuildVacia();
    setBuild(buildVacia);
    persistenciaService.guardarBuildActual(buildVacia);
    setComponenteSeleccionado(null);
    setBuildEditandoId(null);
    setErrorGuardarBuild('');
    setMensajeGuardarBuild('');
    setVista('autenticacion');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar vistaActual={vista} cambiarVista={handleNavegarMenu} sesion={sesion} alCerrarSesion={handleCerrarSesion} totalCarrito={calcularSubtotal(build)} />
      
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
            alGuardarBuild={handleGuardarBuild}
            errorGuardado={errorGuardarBuild}
            mensajeGuardado={mensajeGuardarBuild}
            guardando={guardandoBuild}
            alVerMisBuilds={() => handleNavegarMenu('mis-builds')}
          />
        )}
        {vista === 'mis-builds' && <MisBuildsView key={recargaBuilds} usuarioId={usuarioId} componentes={componentes} alCrearBuild={handleCrearBuild} alEditar={(buildGuardada, seleccion) => { setBuild(seleccion); setBuildEditandoId(buildGuardada.id); setErrorGuardarBuild(''); setMensajeGuardarBuild(''); persistenciaService.guardarBuildActual(seleccion); setVista('armador'); }} />}
        {vista === 'resultado' && (
          <ResultadoView build={build} alIrACotizar={() => setVista('cotizacion')} />
        )}
        {vista === 'cotizacion' && <CotizacionView build={build} />}
        {vista === 'autenticacion' && <AutenticacionView alIniciarSesion={handleAutenticacion} alVolver={() => setVista('inicio')} />}
      </div>
    </div>
  );
}
