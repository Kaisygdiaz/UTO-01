import type { TicketListado } from "@/types/tickets";

export type ReporteSlaFiltro =
  | "todos"
  | "dentro"
  | "fuera"
  | "proximo"
  | "sin-sla";

export interface ReportesFiltros {
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  prioridad: string;
  categoria: string;
  tecnico: string;
  sla: ReporteSlaFiltro;
}

export interface ReportesOpcionesFiltros {
  estados: string[];
  prioridades: string[];
  categorias: string[];
  tecnicos: string[];
}

export interface ReporteResumen {
  totalTickets: number;
  ticketsResueltosOCerrados: number;
  tasaResolucion: number;
  ticketsFueraSla: number;
  porcentajeFueraSla: number;
  ticketsSinAsignar: number;
  porcentajeSinAsignar: number;
  ticketsAltaCriticidad: number;
  porcentajeAltaCriticidad: number;
  ticketsEvaluadosSla: number;
  porcentajeCumplimientoSla: number;
}

export interface ReporteDistribucionItem {
  label: string;
  total: number;
  porcentaje: number;
}

export interface ReporteSlaGrupo {
  label: string;
  total: number;
  evaluados: number;
  dentroSla: number;
  fueraSla: number;
  sinSla: number;
  proximoAVencer: number;
  porcentajeDentroSla: number;
  porcentajeFueraSla: number;
}

export interface ReportesCalculados {
  ticketsFiltrados: TicketListado[];
  opcionesFiltros: ReportesOpcionesFiltros;
  resumen: ReporteResumen;
  porEstado: ReporteDistribucionItem[];
  porPrioridad: ReporteDistribucionItem[];
  porCategoria: ReporteDistribucionItem[];
  porTecnico: ReporteDistribucionItem[];
  slaPorTecnico: ReporteSlaGrupo[];
  slaPorCategoria: ReporteSlaGrupo[];
}