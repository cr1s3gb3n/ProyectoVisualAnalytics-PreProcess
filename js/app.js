// Main Application Controller

import { FilterManager } from "./filters.js";
import { createIntegratedMap } from "./integratedMap.js";
import { createHeatmap } from "./heatmap.js";
import { createTemporalEvolution } from "./temporalEvolution.js";
import { createHourlyPatterns } from "./hourlyPatterns.js";
import { createStationMap } from "./stationMap.js";

class DashboardApp {
  constructor() {
    this.data = {
      estaciones: [],
      industrias: [],
      heatmapData: [],
      temporalData: [],
      hourlyData: [],
    };

    this.filterManager = new FilterManager();
    this.maps = {
      integrated: null,
      station: null,
    };

    this.init();
  }

  async init() {
    this.showLoading();

    try {
      await this.loadData();
      this.filterManager.initializeFilters(this.data);
      this.setupFilterListeners();
      // Apply preset filters on startup
      this.filterManager.updateHighLevelFilters();
      this.renderAllVisualizations();
      this.hideLoading();
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      this.hideLoading();
      alert("Error al cargar los datos. Por favor, intenta de nuevo.");
    }
  }

  async loadData() {
    const baseUrl =
      "https://raw.githubusercontent.com/Almanza33/ProyectoVisualAnalytics-PreProcess/refs/heads/main/data/";

    const [estaciones, industrias, heatmapData, temporalData, hourlyData] =
      await Promise.all([
        d3.csv(`${baseUrl}estaciones_con_promedios.csv`, d3.autoType),
        d3.csv(`${baseUrl}industrias_completo.csv`, d3.autoType),
        d3.csv(`${baseUrl}heatmap_estaciones_contaminantes.csv`, d3.autoType),
        d3.csv(`${baseUrl}contaminacion_diaria_por_estacion.csv`, d3.autoType),
        d3.csv(`${baseUrl}contaminacion_horaria_por_estacion.csv`, d3.autoType),
      ]);

    this.data = {
      estaciones,
      industrias,
      heatmapData,
      temporalData,
      hourlyData,
    };
  }

  setupFilterListeners() {
    this.filterManager.subscribe((filterType) => {
      if (filterType === "high-level") {
        this.renderHighLevelVisualizations();
      } else if (filterType === "low-level") {
        this.renderLowLevelVisualizations();
      } else if (filterType === "station-only") {
        this.renderStationMap();
      }
    });
  }

  renderAllVisualizations() {
    this.renderHighLevelVisualizations();
    this.renderLowLevelVisualizations();
  }

  renderHighLevelVisualizations() {
    // Destroy existing map if it exists
    if (this.maps.integrated) {
      this.maps.integrated.remove();
      this.maps.integrated = null;
    }

    const highFilters = this.filterManager.getHighLevelFilters();

    // Visualization 1: Integrated Map
    this.maps.integrated = createIntegratedMap(
      "vis-integrated-map",
      {
        estaciones: this.data.estaciones,
        industrias: this.data.industrias,
      },
      {
        estado: highFilters.estado,
        tipoCombustible: highFilters.tipoCombustible,
        tipoFuenteEmision: highFilters.tipoFuenteEmision,
        cuenca: highFilters.cuenca,
        contaminante: highFilters.contaminante,
      }
    );

    // Visualization 2: Heatmap (not affected by filters)
    createHeatmap("vis-heatmap", this.data.heatmapData);
  }

  renderLowLevelVisualizations() {
    const lowFilters = this.filterManager.getLowLevelFilters();

    // Visualization 3: Temporal Evolution
    createTemporalEvolution("vis-temporal", this.data.temporalData, {
      station: lowFilters.station,
      pollutants: lowFilters.pollutants,
      period: lowFilters.period,
    });

    // Visualization 4: Hourly Patterns
    createHourlyPatterns("vis-hourly", this.data.hourlyData, {
      station: lowFilters.station,
      pollutants: lowFilters.pollutants,
      period: lowFilters.period,
    });

    // Visualization 5: Station Map
    this.renderStationMap();
  }

  renderStationMap() {
    // Destroy existing map if it exists
    if (this.maps.station) {
      this.maps.station.remove();
      this.maps.station = null;
    }

    const lowFilters = this.filterManager.getLowLevelFilters();

    this.maps.station = createStationMap(
      "vis-station-map",
      {
        estaciones: this.data.estaciones,
        industrias: this.data.industrias,
      },
      {
        station: lowFilters.station,
        radioCercania: lowFilters.radioCercania,
      }
    );
  }

  showLoading() {
    const loader = document.getElementById("loading-indicator");
    if (loader) {
      loader.classList.remove("hidden");
    }
  }

  hideLoading() {
    const loader = document.getElementById("loading-indicator");
    if (loader) {
      setTimeout(() => {
        loader.classList.add("hidden");
      }, 500);
    }
  }
}

// Initialize the dashboard when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new DashboardApp();
});
