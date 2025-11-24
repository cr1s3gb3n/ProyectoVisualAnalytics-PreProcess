// Visualization 4: Hourly Patterns

export function createHourlyPatterns(containerId, data, filters) {
  const { station, pollutants, period } = filters;

  // Clear existing content
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // Define period ranges
  const periodos = {
    "2024-S1": { year: 2024, minMonth: 1, maxMonth: 6 },
    "2025-S1": { year: 2025, minMonth: 1, maxMonth: 6 },
  };

  const periodo = periodos[period];

  // Filter data
  let filteredData = data.filter(
    (d) =>
      d.station === station &&
      pollutants.includes(d.variable) &&
      d.year === periodo.year &&
      d.month >= periodo.minMonth &&
      d.month <= periodo.maxMonth
  );

  if (filteredData.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; padding: 50px;">No hay datos disponibles para los filtros seleccionados.</p>';
    return;
  }

  // Aggregate by hour and variable
  const hourlyData = d3.rollup(
    filteredData,
    (v) => d3.mean(v, (d) => d.avg_value),
    (d) => d.variable,
    (d) => d.hour
  );

  // Convert to array format
  const processedData = [];
  hourlyData.forEach((hours, variable) => {
    hours.forEach((value, hour) => {
      processedData.push({ variable, hour, value });
    });
  });

  // Dimensions
  const margin = { top: 60, right: 150, bottom: 60, left: 70 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Scales
  const x = d3.scaleLinear().domain([0, 23]).range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(processedData, (d) => d.value)])
    .range([height, 0])
    .nice();

  // Color scale
  const color = d3.scaleOrdinal().domain(pollutants).range(d3.schemeCategory10);

  // Line generator
  const line = d3
    .line()
    .x((d) => x(d.hour))
    .y((d) => y(d.value))
    .curve(d3.curveMonotoneX);

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

  // Group data by variable
  const dataByVariable = d3.group(processedData, (d) => d.variable);

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
      .attr("cx", (d) => x(d.hour))
      .attr("cy", (d) => y(d.value))
      .attr("r", 4)
      .attr("fill", color(variable));
  });

  // Add invisible vertical band overlay for hover interactions
  const hours = [...new Set(processedData.map((d) => d.hour))].sort(
    (a, b) => a - b
  );
  const bandWidth = width / 24;

  g.selectAll(".hover-band")
    .data(hours)
    .join("rect")
    .attr("class", "hover-band")
    .attr("x", (d) => x(d) - bandWidth / 2)
    .attr("y", 0)
    .attr("width", bandWidth)
    .attr("height", height)
    .attr("fill", "transparent")
    .attr("pointer-events", "all")
    .on("mouseover", function (event, hour) {
      const dataAtHour = processedData.filter((d) => d.hour === hour);

      // Highlight all circles at this hour
      g.selectAll("circle").attr("r", (d) => (d.hour === hour ? 6 : 4));

      // Show tooltip with all pollutants
      const tooltipContent = `
        <strong>Hora: ${hour}:00</strong><br/>
        ${dataAtHour
          .map(
            (d) =>
              `<span style="color: ${color(d.variable)}">●</span> ${
                d.variable
              }: ${d.value.toFixed(2)}`
          )
          .join("<br/>")}
      `;
      showTooltip(event, tooltipContent);
    })
    .on("mousemove", function (event) {
      moveTooltip(event);
    })
    .on("mouseout", function () {
      // Reset all circles
      g.selectAll("circle").attr("r", 4);
      hideTooltip();
    });

  // X axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(12)
        .tickFormat((d) => `${d}:00`)
    )
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
  svg
    .append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`Patrones Horarios - Estación ${station} (${period})`);

  // Legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width + margin.left + 10}, ${margin.top})`);

  pollutants.forEach((variable, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    legendRow
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", color(variable))
      .attr("stroke-width", 2);

    legendRow
      .append("text")
      .attr("x", 25)
      .attr("y", 4)
      .style("font-size", "11px")
      .text(variable);
  });
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
