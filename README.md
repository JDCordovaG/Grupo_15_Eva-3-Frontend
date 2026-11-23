# BuildMyPC - Frontend

Aplicación web para explorar componentes de PC, armar y guardar builds, solicitar cotizaciones y acceder a las herramientas administrativas o técnicas según el rol de la cuenta.

## Integrantes

- Juan David Córdova
- Vicente Pizarro
- Ignacio Castro

## Requisitos previos

- Node.js 20.19 o superior, o Node.js 22.12 o superior.
- npm (incluido con Node.js).
- El Backend BuildMyPC en ejecución para utilizar las funciones que consultan o guardan datos. La URL predeterminada es `http://localhost:8080/api`.

Comprueba las instalaciones con:

```bash
node -v
npm -v
```

## Instalación y ejecución

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone https://github.com/JDCordovaG/Grupo_15_Eva-3-Frontend.git
   cd Grupo_15_Eva-3-Frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura la URL del Backend en `.env.development` (el archivo actual ya apunta a la configuración local):

   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

   La variable debe apuntar al Gateway y terminar en `/api`. No incluyas credenciales, tokens ni secretos en variables `VITE_*`.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre la dirección que muestre Vite, normalmente <http://localhost:5173>.

Para compilar el sitio para publicación:

```bash
npm run build
```

## Estructura de carpetas

```text
.
├── index.html                 # Documento HTML de entrada
├── src/
│   ├── components/            # Componentes reutilizables de la interfaz
│   │   ├── armador/           # Selección y resumen de componentes
│   │   ├── catalogo/          # Filtros y tarjetas del catálogo
│   │   └── layout/            # Navegación, portada, destacados y pie de página
│   ├── views/                 # Vistas: inicio, catálogo, autenticación, builds y operaciones
│   ├── services/              # Cliente HTTP y servicios de API
│   ├── utils/                 # Roles y reglas auxiliares
│   ├── logica/                # Lógica del armador y sus pruebas
│   ├── __test__/              # Pruebas de componentes y lógica
│   ├── App.jsx                # Enrutamiento y composición principal
│   ├── App.css                # Estilos de la aplicación
│   ├── index.css              # Estilos globales
│   └── main.jsx               # Punto de entrada de React
├── .env.development           # URL local del Gateway
├── package.json              # Dependencias y comandos npm
└── vite.config.js             # Configuración de Vite
```

## Comandos disponibles

- `npm run dev`: inicia Vite en modo desarrollo.
- `npm run build`: crea la versión de producción.
- `npm test`: inicia las pruebas configuradas con Karma.
- `npm run test:watch`: ejecuta las pruebas en modo observación.