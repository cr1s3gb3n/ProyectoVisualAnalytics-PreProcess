# Dashboard de Calidad del Aire e Industrias

Este dashboard interactivo visualiza datos de calidad del aire y su relación con industrias en Colombia.

## Estructura del Proyecto

```
Dashboard/
├── index.html          # Página principal del dashboard
├── styles.css          # Estilos del dashboard
├── js/
│   ├── app.js                 # Controlador principal de la aplicación
│   ├── filters.js             # Sistema de gestión de filtros
│   ├── integratedMap.js       # Visualización 1: Mapa integrado
│   ├── heatmap.js             # Visualización 2: Heatmap de estaciones
│   ├── temporalEvolution.js   # Visualización 3: Evolución temporal
│   ├── hourlyPatterns.js      # Visualización 4: Patrones horarios
│   └── stationMap.js          # Visualización 5: Mapa de estación
└── README.md           # Este archivo
```

## Características

### Visualizaciones de Alto Nivel

1. **Mapa Integrado**: Muestra estaciones de medición (círculos) e industrias (triángulos) en un mapa interactivo.

   - Estaciones coloreadas según nivel de contaminante seleccionado
   - Industrias coloreadas según su estado (Sancionatorio, Seguimiento y Control, En Trámite)
   - Filtrable por: Estado, Tipo de Combustible, Tipo de Fuente de Emisión, Cuenca

2. **Heatmap de Concentraciones**: Visualiza concentraciones promedio de contaminantes por estación.
   - No afectado por filtros
   - Muestra PM10, PM2.5, O3, SO2 para todas las estaciones

### Visualizaciones de Bajo Nivel (Por Estación)

3. **Evolución Temporal**: Gráfico de líneas que muestra la evolución diaria de contaminantes.

   - Filtrable por: Estación, Contaminantes, Período

4. **Patrones Horarios**: Muestra patrones de contaminación por hora del día.

   - Filtrable por: Estación, Contaminantes, Período

5. **Mapa de Estación**: Mapa centrado en una estación específica mostrando industrias cercanas.
   - Industrias cercanas (≤5km) en verde
   - Industrias lejanas (>5km) en naranja
   - El mapa se centra automáticamente al cambiar de estación

## Cómo Usar

### Opción 1: Servidor Local Simple

1. Abre una terminal en la carpeta `Dashboard`
2. Ejecuta un servidor HTTP local:

   **Con Python 3:**

   ```bash
   python -m http.server 8000
   ```

   **Con Node.js (http-server):**

   ```bash
   npx http-server -p 8000
   ```

   **Con PHP:**

   ```bash
   php -S localhost:8000
   ```

3. Abre tu navegador y ve a: `http://localhost:8000`

### Opción 2: Live Server en VS Code

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

### Opción 3: Abrir Directamente (Limitaciones)

Puedes abrir `index.html` directamente en tu navegador, pero algunas funcionalidades pueden estar limitadas debido a políticas CORS. Es recomendable usar un servidor local.

## Filtros

### Filtros de Alto Nivel (Afectan al Mapa Integrado)

- **Estado**: Estado de la industria
- **Tipo de Combustible**: Tipo de combustible usado por la industria
- **Tipo de Fuente de Emisión**: Tipo de fuente de emisión de la industria
- **Cuenca**: Cuenca donde está ubicada la industria
- **Contaminante (Mapa)**: Contaminante a visualizar en las estaciones (PM10, PM2.5, O3, SO2)

### Filtros de Bajo Nivel (Afectan a las Visualizaciones de Estación)

- **Estación**: Selecciona la estación a explorar (por defecto: Estación 2)
- **Contaminantes**: Selecciona qué contaminantes visualizar (múltiple selección)
- **Período**:
  - Primer Semestre 2024 (Enero-Junio 2024)
  - Primer Semestre 2025 (Enero-Junio 2025)

## Fuentes de Datos

Los datos se cargan desde el repositorio GitHub:

- `estaciones_con_promedios.csv`: Datos de estaciones con promedios de contaminantes
- `industrias_completo.csv`: Datos completos de industrias
- `heatmap_estaciones_contaminantes.csv`: Datos para el heatmap
- `contaminacion_diaria_por_estacion.csv`: Datos diarios de contaminación
- `contaminacion_horaria_por_estacion.csv`: Datos horarios de contaminación

## Tecnologías Utilizadas

- **D3.js v7**: Para visualizaciones de datos
- **Leaflet 1.9.4**: Para mapas interactivos
- **Vanilla JavaScript (ES6 Modules)**: Para la lógica de la aplicación
- **CSS3**: Para estilos y diseño responsivo

## Compatibilidad

- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- Responsive design para diferentes tamaños de pantalla
- Requiere JavaScript habilitado

## Notas Importantes

1. **Períodos de Datos**: Los datos solo están disponibles para el primer semestre de 2024 y 2025 debido a gaps en el dataset.

2. **Mapa de Estación**: Este mapa se centra automáticamente en la estación seleccionada y tiene zoom limitado para mantener el foco.

3. **Rendimiento**: La carga inicial puede tardar unos segundos mientras se descargan todos los datasets.

4. **Interactividad**:
   - Haz clic en los marcadores de los mapas para ver información detallada
   - Pasa el cursor sobre los elementos de las gráficas para ver tooltips
   - Los filtros se aplican al hacer clic en "Aplicar Filtros"

## Estructura del Código

El dashboard utiliza una arquitectura modular:

- **app.js**: Coordina la carga de datos y la renderización de visualizaciones
- **filters.js**: Gestiona el estado de los filtros y notifica cambios
- **Módulos de visualización**: Cada visualización es un módulo independiente que puede ser renderizado con diferentes filtros

## Desarrollo y Extensión

Para agregar nuevas visualizaciones:

1. Crea un nuevo módulo en `js/` siguiendo el patrón de los existentes
2. Exporta una función que reciba `(containerId, data, filters)`
3. Importa y llama tu función desde `app.js`
4. Agrega un contenedor en `index.html` si es necesario

## Solución de Problemas

**Problema**: El dashboard no carga o muestra errores de CORS

- **Solución**: Usa un servidor local en lugar de abrir el archivo directamente

**Problema**: Las visualizaciones no se muestran correctamente

- **Solución**: Asegúrate de que tu navegador esté actualizado y tenga JavaScript habilitado

**Problema**: Los datos tardan en cargar

- **Solución**: Esto es normal en la primera carga. Los datos se descargan desde GitHub.

## Créditos

Desarrollado para el curso de Visual Analytics - Universidad 2024-2025
