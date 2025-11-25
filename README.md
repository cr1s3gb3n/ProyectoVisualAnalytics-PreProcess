# Dashboard de Calidad del Aire e Industrias

Este dashboard interactivo visualiza datos de calidad del aire y su relación con industrias en Colombia.

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

6. Abre tu navegador y ve a: `http://localhost:8000`

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
