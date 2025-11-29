// Visualization 2: Heatmap of Station Concentrations

export function createHeatmap(containerId, data) {
  // Clear existing content
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // Dimensions
  const margin = { top: 80, right: 50, bottom: 100, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Get variables
  const stations = [...new Set(data.map((d) => d.station))].sort(
    (a, b) => a - b
  );
  const pollutants = ["PM10", "PM2", "O3", "So2"];

  // Scales
  const x = d3.scaleBand().domain(pollutants).range([0, width]).padding(0.05);

  const y = d3.scaleBand().domain(stations).range([0, height]).padding(0.05);

  // Color scale
  const allValues = data
    .flatMap((d) => pollutants.map((p) => d[p]))
    .filter((v) => v != null && !isNaN(v));
  const colorScale = d3
    .scaleSequential(d3.interpolateYlOrRd)
    .domain([0, d3.max(allValues)]);

  // Create SVG
  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("viewBox", [
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom,
    ])
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create cells
  const cellData = stations.flatMap((station) =>
    pollutants.map((pollutant) => ({
      station,
      pollutant,
      value: data.find((d) => d.station === station)?.[pollutant],
    }))
  );

  g.selectAll("rect")
    .data(cellData)
    .join("rect")
    .attr("x", (d) => x(d.pollutant))
    .attr("y", (d) => y(d.station))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (d) =>
      d.value != null && !isNaN(d.value) ? colorScale(d.value) : "#f0f0f0"
    )
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
      showTooltip(
        event,
        `
                <strong>Estación ${d.station}</strong><br/>
                ${d.pollutant}: ${
          d.value != null && !isNaN(d.value) ? d.value.toFixed(2) : "N/A"
        }
            `
      );
    })
    .on("mousemove", function (event) {
      moveTooltip(event);
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1);
      hideTooltip();
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
  svg
    .append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Concentraciones Promedio de Contaminantes por Estación");

  // Color legend
  const legendWidth = 300;
  const legendHeight = 20;

  const legendScale = d3
    .scaleLinear()
    .domain(colorScale.domain())
    .range([0, legendWidth]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(5)
    .tickFormat((d) => d.toFixed(0));

  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left + (width - legendWidth) / 2}, ${
        height + margin.top + 60
      })`
    );

  const defs = svg.append("defs");
  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "heatmap-gradient");

  linearGradient
    .selectAll("stop")
    .data(d3.range(0, 1.1, 0.1))
    .join("stop")
    .attr("offset", (d) => `${d * 100}%`)
    .attr("stop-color", (d) => colorScale(legendScale.invert(d * legendWidth)));

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#heatmap-gradient)");

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);
}

// Tooltip helper functions
function showTooltip(event, html) {
  let tooltip = d3.select("body").select(".tooltip");
  if (tooltip.empty()) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("display", "none");
  }
  tooltip
    .html(html)
    .style("display", "block")
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 10 + "px");
}

function moveTooltip(event) {
  d3.select("body")
    .select(".tooltip")
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 10 + "px");
}

function hideTooltip() {
  d3.select("body").select(".tooltip").style("display", "none");
}
