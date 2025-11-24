# Visualization 1: Integrated Map (Stations + Industries)

// Mapa Integrado con Leaflet
{
// Load Leaflet correctly for Observable
const L = await require('leaflet@1.9.4');

// Parameters
const FILTRO_ESTADO = null;
const FILTRO_TIPO_COMBUSTIBLE = null;
const FILTRO_TIPO_FUENTE_EMISION = null;
const FILTRO_CUENCA = null;
const CONTAMINANTE_MAPA = 'PM10';

// Load data
const estaciones = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/estaciones_con_promedios.csv", d3.autoType);
let industrias = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/industrias_completo.csv", d3.autoType);

// Apply filters
if (FILTRO_ESTADO) industrias = industrias.filter(d => d.Estado === FILTRO_ESTADO);
if (FILTRO_TIPO_COMBUSTIBLE) industrias = industrias.filter(d => d.TipoCombustible === FILTRO_TIPO_COMBUSTIBLE);
if (FILTRO_TIPO_FUENTE_EMISION) industrias = industrias.filter(d => d.TipoFuenteEmision === FILTRO_TIPO_FUENTE_EMISION);
if (FILTRO_CUENCA) industrias = industrias.filter(d => d.Cuenca === FILTRO_CUENCA);

// Create container with Leaflet CSS
const container = html`    <link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/>
    <div style="height: 700px; width: 100%; position: relative;"></div>
 `;

const mapDiv = container.querySelector('div');

// Initialize map centered on region
const map = L.map(mapDiv).setView([5.0, -74.0], 9);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© OpenStreetMap contributors',
maxZoom: 18
}).addTo(map);

// Color scale for stations
const contaminantValues = estaciones.map(d => d[CONTAMINANTE_MAPA]).filter(v => v != null);
const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
.domain([d3.min(contaminantValues), d3.max(contaminantValues)]);

// Color map for industries
const colorMapEstado = {
'Sancionatorio': '#e74c3c',
'Seguimiento y Control': '#27ae60',
'En Trámite': '#2c3e50'
};

// Add industries (triangles)
industrias.forEach(d => {
const triangleIcon = L.divIcon({
html: `<svg width="20" height="20" viewBox="0 0 20 20">
               <path d="M10,2 L18,18 L2,18 Z" 
                     fill="${colorMapEstado[d.Estado] || '#95a5a6'}" 
                     stroke="white" 
                     stroke-width="1"
                     opacity="0.8"/>
             </svg>`,
className: '',
iconSize: [20, 20],
iconAnchor: [10, 15]
});

    const marker = L.marker([d.latitude, d.longitude], { icon: triangleIcon }).addTo(map);

    marker.bindPopup(`
      <b>${d.IDExpediente}</b><br/>
      <b>Estado:</b> ${d.Estado}<br/>
      <b>Regional:</b> ${d.Regional}<br/>
      <b>Departamento:</b> ${d.Departamento}<br/>
      <b>Municipio:</b> ${d.Municipio}<br/>
      <b>Tipo Combustible:</b> ${d.TipoCombustible}<br/>
      <b>Tipo Fuente Emisión:</b> ${d.TipoFuenteEmision}<br/>
      <b>Cuenca:</b> ${d.Cuenca}<br/>
      <b>Estación cercana 1:</b> ${d.estacion_cercana_1} (${d.distancia_cercana_1} km)<br/>
      <b>Estación cercana 2:</b> ${d.estacion_cercana_2} (${d.distancia_cercana_2} km)
    `);

});

// Add stations (circles with color by pollutant level)
estaciones.forEach(d => {
const color = colorScale(d[CONTAMINANTE_MAPA]);

    const circleMarker = L.circleMarker([d.latitude, d.longitude], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    const pollutants = ['PM10', 'PM2', 'O3', 'So2']
      .filter(p => d[p] != null)
      .map(p => `<b>${p}:</b> ${d[p].toFixed(2)}`)
      .join('<br/>');

    circleMarker.bindPopup(`
      <b>Estación ${d.station_id}</b><br/>
      ${d.state}<br/>
      <br/>
      <b>Contaminantes:</b><br/>
      ${pollutants}
    `);

});

// Add legend
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
const div = L.DomUtil.create('div', 'legend');
div.style.background = 'rgba(255, 255, 255, 0.9)';
div.style.padding = '10px';
div.style.borderRadius = '5px';
div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    // Gradient legend for stations
    const minVal = d3.min(contaminantValues).toFixed(0);
    const maxVal = d3.max(contaminantValues).toFixed(0);

    div.innerHTML = `
      <div style="margin-bottom: 10px;">
        <b>${CONTAMINANTE_MAPA} (Estaciones)</b><br/>
        <div style="background: linear-gradient(to right, ${colorScale(d3.min(contaminantValues))}, ${colorScale(d3.max(contaminantValues))});
                    height: 15px; width: 150px; margin: 5px 0;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>${minVal}</span>
          <span>${maxVal}</span>
        </div>
      </div>
      <div>
        <b>Estado Industrias:</b><br/>
        <div style="margin: 5px 0;">
          <svg width="15" height="15" style="vertical-align: middle;">
            <path d="M7.5,2 L13,13 L2,13 Z" fill="#e74c3c" stroke="white"/>
          </svg>
          <span style="font-size: 11px;"> Sancionatorio</span>
        </div>
        <div style="margin: 5px 0;">
          <svg width="15" height="15" style="vertical-align: middle;">
            <path d="M7.5,2 L13,13 L2,13 Z" fill="#27ae60" stroke="white"/>
          </svg>
          <span style="font-size: 11px;"> Seguimiento y Control</span>
        </div>
        <div style="margin: 5px 0;">
          <svg width="15" height="15" style="vertical-align: middle;">
            <path d="M7.5,2 L13,13 L2,13 Z" fill="#2c3e50" stroke="white"/>
          </svg>
          <span style="font-size: 11px;"> En Trámite</span>
        </div>
      </div>
    `;

    return div;

};

legend.addTo(map);

// Add title as control
const title = L.control({ position: 'topleft' });
title.onAdd = function(map) {
const div = L.DomUtil.create('div', 'title');
div.style.background = 'rgba(255, 255, 255, 0.9)';
div.style.padding = '10px';
div.style.borderRadius = '5px';
div.style.fontWeight = 'bold';
div.innerHTML = `Mapa Integrado: Estaciones (${CONTAMINANTE_MAPA}) + Industrias`;
return div;
};
title.addTo(map);

// Important: Invalidate size after container is attached to DOM
setTimeout(() => map.invalidateSize(), 100);

return container;
}

# Visualization 2: Heatmap of Station Concentrations

// Heatmap de Concentraciones Promedio por Estación
{
// Load data
const data = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/heatmap_estaciones_contaminantes.csv", d3.autoType);

// Dimensions
const margin = {top: 80, right: 50, bottom: 100, left: 80};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Get variables
const stations = data.map(d => d.station).sort((a, b) => a - b);

const pollutants = ['PM10', 'PM2', 'O3', 'So2'];

// Scales
const x = d3.scaleBand()
.domain(pollutants)
.range([0, width])
.padding(0.05);

const y = d3.scaleBand()
.domain(stations)
.range([0, height])
.padding(0.05);

// Color scale
const allValues = data.flatMap(d => pollutants.map(p => d[p])).filter(v => v != null);
const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
.domain([0, d3.max(allValues)]);

// Create SVG
const svg = d3.create("svg")
.attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Create cells
const cells = g.append("g")
.selectAll("rect")
.data(stations.flatMap(station =>
pollutants.map(pollutant => ({
station,
pollutant,
value: data.find(d => d.station === station)?.[pollutant]
}))
))
.join("rect")
.attr("x", d => x(d.pollutant))
.attr("y", d => y(d.station))
.attr("width", x.bandwidth())
.attr("height", y.bandwidth())
.attr("fill", d => d.value != null ? colorScale(d.value) : "#f0f0f0")
.attr("stroke", "#fff")
.attr("stroke-width", 1)
.on("mouseover", function(event, d) {
d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
tooltip.style("display", "block")
.html(`          <strong>Estación ${d.station}</strong><br/>
          ${d.pollutant}: ${d.value != null ? d.value.toFixed(2) : 'N/A'}
       `);
})
.on("mousemove", function(event) {
tooltip.style("left", (event.pageX + 10) + "px")
.style("top", (event.pageY - 10) + "px");
})
.on("mouseout", function() {
d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1);
tooltip.style("display", "none");
});

// X axis
g.append("g")
.attr("transform", `translate(0,${height})`)
.call(d3.axisBottom(x))
.selectAll("text")
.style("font-size", "12px");

// Y axis
g.append("g")
.call(d3.axisLeft(y))
.selectAll("text")
.style("font-size", "11px");

// Axis labels
g.append("text")
.attr("x", width / 2)
.attr("y", height + 40)
.attr("text-anchor", "middle")
.style("font-size", "14px")
.text("Contaminante");

g.append("text")
.attr("transform", "rotate(-90)")
.attr("x", -height / 2)
.attr("y", -60)
.attr("text-anchor", "middle")
.style("font-size", "14px")
.text("Estación");

// Title
svg.append("text")
.attr("x", (width + margin.left + margin.right) / 2)
.attr("y", 30)
.attr("text-anchor", "middle")
.style("font-size", "18px")
.style("font-weight", "bold")
.text("Concentraciones Promedio de Contaminantes por Estación");

// Color legend
const legendWidth = 300;
const legendHeight = 20;

const legendScale = d3.scaleLinear()
.domain(colorScale.domain())
.range([0, legendWidth]);

const legendAxis = d3.axisBottom(legendScale)
.ticks(5)
.tickFormat(d => d.toFixed(0));

const legend = svg.append("g")
.attr("transform", `translate(${margin.left + (width - legendWidth) / 2}, ${height + margin.top + 60})`);

const defs = svg.append("defs");
const linearGradient = defs.append("linearGradient")
.attr("id", "heatmap-gradient");

linearGradient.selectAll("stop")
.data(d3.range(0, 1.1, 0.1))
.join("stop")
.attr("offset", d => `${d * 100}%`)
.attr("stop-color", d => colorScale(legendScale.invert(d \* legendWidth)));

legend.append("rect")
.attr("width", legendWidth)
.attr("height", legendHeight)
.style("fill", "url(#heatmap-gradient)");

legend.append("g")
.attr("transform", `translate(0, ${legendHeight})`)
.call(legendAxis);

// Tooltip
const tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("position", "absolute")
.style("display", "none")
.style("background", "rgba(255, 255, 255, 0.95)")
.style("border", "1px solid #ddd")
.style("border-radius", "4px")
.style("padding", "10px")
.style("font-size", "12px")
.style("pointer-events", "none")
.style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");

return svg.node();
}

# Visualization 3: Temporal Evolution

// Evolución Temporal de Contaminantes por Estación
{
// Parameters
const ESTACION_SELECCIONADA = 2;
const CONTAMINANTES_SELECCIONADOS = ['PM10', 'PM2', 'O3', 'So2'];
const PERIODO_SELECCIONADO = '2024-S1'; // '2024-S1' or '2025-S1'

// Load data
let data = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/contaminacion_diaria_por_estacion.csv", d3.autoType);

// Filter by period
const periodos = {
'2024-S1': { year: 2024, minMonth: 1, maxMonth: 6 },
'2025-S1': { year: 2025, minMonth: 1, maxMonth: 6 }
};

const periodo = periodos[PERIODO_SELECCIONADO];

data = data.filter(d =>
d.station === ESTACION_SELECCIONADA &&
CONTAMINANTES_SELECCIONADOS.includes(d.variable) &&
d.year === periodo.year &&
d.month >= periodo.minMonth &&
d.month <= periodo.maxMonth
);

// Parse dates
data.forEach(d => {
d.date = new Date(d.year, d.month - 1, d.day);
});

// Dimensions
const margin = {top: 60, right: 150, bottom: 60, left: 70};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Scales
const x = d3.scaleTime()
.domain(d3.extent(data, d => d.date))
.range([0, width]);

const y = d3.scaleLinear()
.domain([0, d3.max(data, d => d.avg_value)])
.range([height, 0])
.nice();

// Color scale
const color = d3.scaleOrdinal()
.domain(CONTAMINANTES_SELECCIONADOS)
.range(d3.schemeCategory10);

// Line generator
const line = d3.line()
.x(d => x(d.date))
.y(d => y(d.avg_value))
.curve(d3.curveMonotoneX);

// Create SVG
const svg = d3.create("svg")
.attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Group data by variable
const dataByVariable = d3.group(data, d => d.variable);

// Draw lines
dataByVariable.forEach((values, variable) => {
g.append("path")
.datum(values)
.attr("fill", "none")
.attr("stroke", color(variable))
.attr("stroke-width", 2)
.attr("d", line);

    // Add circles for data points
    g.selectAll(`.circle-${variable}`)
      .data(values)
      .join("circle")
      .attr("class", `circle-${variable}`)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.avg_value))
      .attr("r", 3)
      .attr("fill", color(variable))
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 5);
        tooltip.style("display", "block")
          .html(`
            <strong>${d.variable}</strong><br/>
            Fecha: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>
            Concentración: ${d.avg_value.toFixed(2)}
          `);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 3);
        tooltip.style("display", "none");
      });

});

// X axis
g.append("g")
.attr("transform", `translate(0,${height})`)
.call(d3.axisBottom(x).ticks(6))
.selectAll("text")
.style("font-size", "11px");

// Y axis
g.append("g")
.call(d3.axisLeft(y))
.selectAll("text")
.style("font-size", "11px");

// Axis labels
g.append("text")
.attr("x", width / 2)
.attr("y", height + 45)
.attr("text-anchor", "middle")
.style("font-size", "13px")
.text("Fecha");

g.append("text")
.attr("transform", "rotate(-90)")
.attr("x", -height / 2)
.attr("y", -50)
.attr("text-anchor", "middle")
.style("font-size", "13px")
.text("Concentración promedio diaria");

// Title
svg.append("text")
.attr("x", (width + margin.left + margin.right) / 2)
.attr("y", 25)
.attr("text-anchor", "middle")
.style("font-size", "16px")
.style("font-weight", "bold")
.text(`Evolución Temporal - Estación ${ESTACION_SELECCIONADA} (${PERIODO_SELECCIONADO})`);

// Legend
const legend = svg.append("g")
.attr("transform", `translate(${width + margin.left + 10}, ${margin.top})`);

CONTAMINANTES_SELECCIONADOS.forEach((variable, i) => {
const legendRow = legend.append("g")
.attr("transform", `translate(0, ${i * 20})`);

    legendRow.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", color(variable))
      .attr("stroke-width", 2);

    legendRow.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .style("font-size", "11px")
      .text(variable);

});

// Tooltip
const tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("position", "absolute")
.style("display", "none")
.style("background", "rgba(255, 255, 255, 0.95)")
.style("border", "1px solid #ddd")
.style("border-radius", "4px")
.style("padding", "10px")
.style("font-size", "12px")
.style("pointer-events", "none")
.style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");

return svg.node();
}

# Visualization 4: Hourly Patterns

// Patrones Horarios de Contaminantes por Estación
{
// Parameters
const ESTACION_SELECCIONADA = 2;
const CONTAMINANTES_SELECCIONADOS = ['PM10', 'PM2', 'O3', 'So2'];
const PERIODO_SELECCIONADO = '2024-S1';

// Load data
let data = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/contaminacion_horaria_por_estacion.csv", d3.autoType);

// Filter by period
const periodos = {
'2024-S1': { year: 2024, minMonth: 1, maxMonth: 6 },
'2025-S1': { year: 2025, minMonth: 1, maxMonth: 6 }
};

const periodo = periodos[PERIODO_SELECCIONADO];

data = data.filter(d =>
d.station === ESTACION_SELECCIONADA &&
CONTAMINANTES_SELECCIONADOS.includes(d.variable) &&
d.year === periodo.year &&
d.month >= periodo.minMonth &&
d.month <= periodo.maxMonth
);

// Aggregate by hour and variable
const hourlyData = d3.rollup(
data,
v => d3.mean(v, d => d.avg_value),
d => d.variable,
d => d.hour
);

// Convert to array format
const processedData = [];
hourlyData.forEach((hours, variable) => {
hours.forEach((value, hour) => {
processedData.push({ variable, hour, value });
});
});

// Dimensions
const margin = {top: 60, right: 150, bottom: 60, left: 70};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Scales
const x = d3.scaleLinear()
.domain([0, 23])
.range([0, width]);

const y = d3.scaleLinear()
.domain([0, d3.max(processedData, d => d.value)])
.range([height, 0])
.nice();

// Color scale
const color = d3.scaleOrdinal()
.domain(CONTAMINANTES_SELECCIONADOS)
.range(d3.schemeCategory10);

// Line generator
const line = d3.line()
.x(d => x(d.hour))
.y(d => y(d.value))
.curve(d3.curveMonotoneX);

// Create SVG
const svg = d3.create("svg")
.attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Group data by variable
const dataByVariable = d3.group(processedData, d => d.variable);

// Draw lines
dataByVariable.forEach((values, variable) => {
const sortedValues = values.sort((a, b) => a.hour - b.hour);

    g.append("path")
      .datum(sortedValues)
      .attr("fill", "none")
      .attr("stroke", color(variable))
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add circles for data points
    g.selectAll(`.circle-${variable}`)
      .data(sortedValues)
      .join("circle")
      .attr("class", `circle-${variable}`)
      .attr("cx", d => x(d.hour))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", color(variable))
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 6);
        tooltip.style("display", "block")
          .html(`
            <strong>${d.variable}</strong><br/>
            Hora: ${d.hour}:00<br/>
            Concentración: ${d.value.toFixed(2)}
          `);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 4);
        tooltip.style("display", "none");
      });

});

// X axis
g.append("g")
.attr("transform", `translate(0,${height})`)
.call(d3.axisBottom(x).ticks(12).tickFormat(d => `${d}:00`))
.selectAll("text")
.style("font-size", "10px")
.attr("transform", "rotate(-45)")
.style("text-anchor", "end");

// Y axis
g.append("g")
.call(d3.axisLeft(y))
.selectAll("text")
.style("font-size", "11px");

// Axis labels
g.append("text")
.attr("x", width / 2)
.attr("y", height + 50)
.attr("text-anchor", "middle")
.style("font-size", "13px")
.text("Hora del día");

g.append("text")
.attr("transform", "rotate(-90)")
.attr("x", -height / 2)
.attr("y", -50)
.attr("text-anchor", "middle")
.style("font-size", "13px")
.text("Concentración promedio");

// Title
svg.append("text")
.attr("x", (width + margin.left + margin.right) / 2)
.attr("y", 25)
.attr("text-anchor", "middle")
.style("font-size", "16px")
.style("font-weight", "bold")
.text(`Patrones Horarios - Estación ${ESTACION_SELECCIONADA} (${PERIODO_SELECCIONADO})`);

// Legend
const legend = svg.append("g")
.attr("transform", `translate(${width + margin.left + 10}, ${margin.top})`);

CONTAMINANTES_SELECCIONADOS.forEach((variable, i) => {
const legendRow = legend.append("g")
.attr("transform", `translate(0, ${i * 20})`);

    legendRow.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", color(variable))
      .attr("stroke-width", 2);

    legendRow.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .style("font-size", "11px")
      .text(variable);

});

// Tooltip
const tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("position", "absolute")
.style("display", "none")
.style("background", "rgba(255, 255, 255, 0.95)")
.style("border", "1px solid #ddd")
.style("border-radius", "4px")
.style("padding", "10px")
.style("font-size", "12px")
.style("pointer-events", "none")
.style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");

return svg.node();
}

# Visualization 5: Static Station Map

// Mapa de Estación Seleccionada con Leaflet
{
// Load Leaflet correctly for Observable
const L = await require('leaflet@1.9.4');

// Parameters
const ESTACION_SELECCIONADA = 3;
const RADIO_CERCANIA_KM = 5;

// Load data
const estaciones = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/estaciones_con_promedios.csv", d3.autoType);
const industrias = await d3.csv("https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/industrias_completo.csv", d3.autoType);

// Get selected station
const estacionSeleccionada = estaciones.find(d => d.station_id === ESTACION_SELECCIONADA);

// Haversine distance function
function haversineDistance(lat1, lon1, lat2, lon2) {
const R = 6371;
const dLat = (lat2 - lat1) _ Math.PI / 180;
const dLon = (lon2 - lon1) _ Math.PI / 180;
const a = Math.sin(dLat/2) _ Math.sin(dLat/2) +
Math.cos(lat1 _ Math.PI / 180) _ Math.cos(lat2 _ Math.PI / 180) _
Math.sin(dLon/2) _ Math.sin(dLon/2);
const c = 2 _ Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
return R _ c;
}

// Calculate distances
industrias.forEach(d => {
d.distancia = haversineDistance(
estacionSeleccionada.latitude, estacionSeleccionada.longitude,
d.latitude, d.longitude
);
d.cercana = d.distancia <= RADIO_CERCANIA_KM;
});

// Create container with Leaflet CSS
const container = html`    <link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/>
    <div style="height: 600px; width: 100%; position: relative;"></div>
 `;

const mapDiv = container.querySelector('div');

// Initialize map centered on selected station
const map = L.map(mapDiv).setView([estacionSeleccionada.latitude, estacionSeleccionada.longitude], 11);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© OpenStreetMap contributors',
maxZoom: 18
}).addTo(map);

// Add distant industries (orange triangles)
industrias.filter(d => !d.cercana).forEach(d => {
const triangleIcon = L.divIcon({
html: `<svg width="16" height="16" viewBox="0 0 16 16">
               <path d="M8,2 L14,14 L2,14 Z" 
                     fill="#e67e22" 
                     stroke="white" 
                     stroke-width="1"
                     opacity="0.7"/>
             </svg>`,
className: '',
iconSize: [16, 16],
iconAnchor: [8, 12]
});

    const marker = L.marker([d.latitude, d.longitude], { icon: triangleIcon }).addTo(map);

    marker.bindPopup(`
      <b>${d.IDExpediente}</b><br/>
      <b>Estado:</b> ${d.Estado}<br/>
      <b>Regional:</b> ${d.Regional}<br/>
      <b>Departamento:</b> ${d.Departamento}<br/>
      <b>Municipio:</b> ${d.Municipio}<br/>
      <b>Tipo Combustible:</b> ${d.TipoCombustible}<br/>
      <b>Tipo Fuente Emisión:</b> ${d.TipoFuenteEmision}<br/>
      <b>Cuenca:</b> ${d.Cuenca}<br/>
      <b>Distancia:</b> ${d.distancia.toFixed(2)} km
    `);

});

// Add nearby industries (green triangles)
industrias.filter(d => d.cercana).forEach(d => {
const triangleIcon = L.divIcon({
html: `<svg width="16" height="16" viewBox="0 0 16 16">
               <path d="M8,2 L14,14 L2,14 Z" 
                     fill="#27ae60" 
                     stroke="white" 
                     stroke-width="1"
                     opacity="0.8"/>
             </svg>`,
className: '',
iconSize: [16, 16],
iconAnchor: [8, 12]
});

    const marker = L.marker([d.latitude, d.longitude], { icon: triangleIcon }).addTo(map);

    marker.bindPopup(`
      <b>${d.IDExpediente}</b><br/>
      <b>Estado:</b> ${d.Estado}<br/>
      <b>Regional:</b> ${d.Regional}<br/>
      <b>Departamento:</b> ${d.Departamento}<br/>
      <b>Municipio:</b> ${d.Municipio}<br/>
      <b>Tipo Combustible:</b> ${d.TipoCombustible}<br/>
      <b>Tipo Fuente Emisión:</b> ${d.TipoFuenteEmision}<br/>
      <b>Cuenca:</b> ${d.Cuenca}<br/>
      <b>Distancia:</b> ${d.distancia.toFixed(2)} km
    `);

});

// Add selected station (special marker)
const stationIcon = L.divIcon({
html: `<svg width="30" height="30" viewBox="0 0 30 30">
             <circle cx="15" cy="15" r="12" fill="#3498db" stroke="white" stroke-width="3"/>
             <text x="15" y="20" text-anchor="middle" fill="white" font-weight="bold" font-size="14">${ESTACION_SELECCIONADA}</text>
           </svg>`,
className: '',
iconSize: [30, 30],
iconAnchor: [15, 15]
});

const stationMarker = L.marker([estacionSeleccionada.latitude, estacionSeleccionada.longitude], {
icon: stationIcon
}).addTo(map);

stationMarker.bindPopup(`    <b>Estación ${estacionSeleccionada.station_id}</b><br/>
    ${estacionSeleccionada.state}
 `);

// Add legend
const legend = L.control({ position: 'topright' });

legend.onAdd = function(map) {
const div = L.DomUtil.create('div', 'legend');
div.style.background = 'rgba(255, 255, 255, 0.9)';
div.style.padding = '10px';
div.style.borderRadius = '5px';
div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    const cercanas = industrias.filter(d => d.cercana).length;
    const lejanas = industrias.filter(d => !d.cercana).length;

    div.innerHTML = `
      <div style="margin: 5px 0;">
        <svg width="20" height="20" style="vertical-align: middle;">
          <circle cx="10" cy="10" r="8" fill="#3498db" stroke="white" stroke-width="2"/>
        </svg>
        <span style="font-size: 11px;"> Estación ${ESTACION_SELECCIONADA}</span>
      </div>
      <div style="margin: 5px 0;">
        <svg width="15" height="15" style="vertical-align: middle;">
          <path d="M7.5,2 L13,13 L2,13 Z" fill="#27ae60" stroke="white"/>
        </svg>
        <span style="font-size: 11px;"> Cercana ≤${RADIO_CERCANIA_KM}km (${cercanas})</span>
      </div>
      <div style="margin: 5px 0;">
        <svg width="15" height="15" style="vertical-align: middle;">
          <path d="M7.5,2 L13,13 L2,13 Z" fill="#e67e22" stroke="white"/>
        </svg>
        <span style="font-size: 11px;"> Lejana >${RADIO_CERCANIA_KM}km (${lejanas})</span>
      </div>
    `;

    return div;

};

legend.addTo(map);

// Add title
const title = L.control({ position: 'topleft' });
title.onAdd = function(map) {
const div = L.DomUtil.create('div', 'title');
div.style.background = 'rgba(255, 255, 255, 0.9)';
div.style.padding = '10px';
div.style.borderRadius = '5px';
div.style.fontWeight = 'bold';
div.innerHTML = `Mapa de Estación ${ESTACION_SELECCIONADA} e Industrias`;
return div;
};
title.addTo(map);

// Important: Invalidate size after container is attached to DOM
setTimeout(() => map.invalidateSize(), 100);

return container;
}
