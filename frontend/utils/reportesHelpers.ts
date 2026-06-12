import type { TicketListado } from "@/types/tickets";
import type {
  ReporteDistribucionItem,
  ReporteResumen,
  ReporteSlaFiltro,
  ReporteSlaGrupo,
  ReportesFiltros,
  ReportesOpcionesFiltros,
} from "@/types/reportes";

export const filtrosReportesIniciales: ReportesFiltros = {
  fechaInicio: "",
  fechaFin: "",
  estado: "",
  prioridad: "",
  categoria: "",
  tecnico: "",
  sla: "todos",
};

const SIN_ASIGNAR = "Sin asignar";

export function filtrarTicketsReportes(
  tickets: TicketListado[],
  filtros: ReportesFiltros
) {
  return tickets.filter((ticket) => {
    return (
      cumpleFiltroTexto(ticket.estado, filtros.estado) &&
      cumpleFiltroTexto(ticket.prioridad, filtros.prioridad) &&
      cumpleFiltroTexto(ticket.categoria, filtros.categoria) &&
      cumpleFiltroTexto(obtenerTecnico(ticket), filtros.tecnico) &&
      cumpleFiltroSla(ticket, filtros.sla) &&
      cumpleRangoFechas(ticket.fechaCreacion, filtros.fechaInicio, filtros.fechaFin)
    );
  });
}

export function generarOpcionesFiltros(
  tickets: TicketListado[]
): ReportesOpcionesFiltros {
  return {
    estados: obtenerValoresUnicos(tickets.map((ticket) => ticket.estado)),
    prioridades: obtenerValoresUnicos(tickets.map((ticket) => ticket.prioridad)),
    categorias: obtenerValoresUnicos(tickets.map((ticket) => ticket.categoria)),
    tecnicos: obtenerValoresUnicos(tickets.map((ticket) => obtenerTecnico(ticket))),
  };
}

export function calcularResumenReportes(
  tickets: TicketListado[]
): ReporteResumen {
  const totalTickets = tickets.length;

  const ticketsResueltosOCerrados = tickets.filter((ticket) =>
    esEstadoFinalizado(ticket.estado)
  ).length;

  const ticketsFueraSla = tickets.filter((ticket) => ticket.estaFueraSla).length;

  const ticketsSinAsignar = tickets.filter((ticket) =>
    esTicketSinAsignar(ticket)
  ).length;

  const ticketsAltaCriticidad = tickets.filter((ticket) =>
    esPrioridadAltaOCritica(ticket.prioridad)
  ).length;

  const ticketsEvaluadosSla = tickets.filter((ticket) =>
    tieneSla(ticket)
  ).length;

  const ticketsDentroSla = tickets.filter(
    (ticket) => tieneSla(ticket) && !ticket.estaFueraSla
  ).length;

  return {
    totalTickets,
    ticketsResueltosOCerrados,
    tasaResolucion: calcularPorcentaje(ticketsResueltosOCerrados, totalTickets),
    ticketsFueraSla,
    porcentajeFueraSla: calcularPorcentaje(ticketsFueraSla, totalTickets),
    ticketsSinAsignar,
    porcentajeSinAsignar: calcularPorcentaje(ticketsSinAsignar, totalTickets),
    ticketsAltaCriticidad,
    porcentajeAltaCriticidad: calcularPorcentaje(
      ticketsAltaCriticidad,
      totalTickets
    ),
    ticketsEvaluadosSla,
    porcentajeCumplimientoSla: calcularPorcentaje(
      ticketsDentroSla,
      ticketsEvaluadosSla
    ),
  };
}

export function calcularDistribucion(
  tickets: TicketListado[],
  obtenerLabel: (ticket: TicketListado) => string
): ReporteDistribucionItem[] {
  const totalTickets = tickets.length;
  const acumulado = new Map<string, number>();

  tickets.forEach((ticket) => {
    const label = normalizarLabel(obtenerLabel(ticket));
    acumulado.set(label, (acumulado.get(label) ?? 0) + 1);
  });

  return Array.from(acumulado.entries())
    .map(([label, total]) => ({
      label,
      total,
      porcentaje: calcularPorcentaje(total, totalTickets),
    }))
    .sort((a, b) => b.total - a.total);
}

export function calcularSlaPorGrupo(
  tickets: TicketListado[],
  obtenerLabel: (ticket: TicketListado) => string
): ReporteSlaGrupo[] {
  const grupos = new Map<string, ReporteSlaGrupo>();

  tickets.forEach((ticket) => {
    const label = normalizarLabel(obtenerLabel(ticket));

    const grupoActual =
      grupos.get(label) ??
      ({
        label,
        total: 0,
        evaluados: 0,
        dentroSla: 0,
        fueraSla: 0,
        sinSla: 0,
        proximoAVencer: 0,
        porcentajeDentroSla: 0,
        porcentajeFueraSla: 0,
      } satisfies ReporteSlaGrupo);

    grupoActual.total += 1;

    if (!tieneSla(ticket)) {
      grupoActual.sinSla += 1;
    } else {
      grupoActual.evaluados += 1;

      if (ticket.estaFueraSla) {
        grupoActual.fueraSla += 1;
      } else {
        grupoActual.dentroSla += 1;
      }

      if (ticket.estaProximoAVencerSla) {
        grupoActual.proximoAVencer += 1;
      }
    }

    grupos.set(label, grupoActual);
  });

  return Array.from(grupos.values())
    .map((grupo) => ({
      ...grupo,
      porcentajeDentroSla: calcularPorcentaje(grupo.dentroSla, grupo.evaluados),
      porcentajeFueraSla: calcularPorcentaje(grupo.fueraSla, grupo.evaluados),
    }))
    .sort((a, b) => b.total - a.total);
}

export function generarAnalisisReportes(resumen: ReporteResumen) {
  if (resumen.totalTickets === 0) {
    return "No hay tickets que coincidan con los filtros seleccionados. Ajusta los filtros para generar un análisis estadístico.";
  }

  if (resumen.porcentajeFueraSla >= 50) {
    return `El ${formatearPorcentaje(
      resumen.porcentajeFueraSla
    )}% de los tickets filtrados se encuentra fuera de SLA. Se recomienda revisar tiempos de respuesta, carga de trabajo y priorización.`;
  }

  if (resumen.porcentajeSinAsignar >= 25) {
    return `El ${formatearPorcentaje(
      resumen.porcentajeSinAsignar
    )}% de los tickets filtrados no tiene técnico asignado. Se recomienda fortalecer el proceso de asignación.`;
  }

  if (resumen.tasaResolucion >= 70) {
    return `La tasa de resolución es del ${formatearPorcentaje(
      resumen.tasaResolucion
    )}%, lo que refleja un avance positivo en la atención de incidentes.`;
  }

  return `El reporte muestra ${resumen.totalTickets} tickets filtrados, con una tasa de resolución del ${formatearPorcentaje(
    resumen.tasaResolucion
  )}% y un incumplimiento SLA del ${formatearPorcentaje(
    resumen.porcentajeFueraSla
  )}%.`;
}

export function generarCsvReportes(tickets: TicketListado[]) {
  const encabezados = [
    "ID",
    "Titulo",
    "Estado",
    "Prioridad",
    "Categoria",
    "Solicitante",
    "Tecnico asignado",
    "Fecha creacion",
    "Fecha limite SLA",
    "Fuera SLA",
    "Proximo a vencer SLA",
  ];

  const filas = tickets.map((ticket) => [
    ticket.id,
    ticket.titulo,
    ticket.estado,
    ticket.prioridad,
    ticket.categoria,
    ticket.solicitante,
    obtenerTecnico(ticket),
    ticket.fechaCreacion,
    ticket.fechaLimiteSla ?? "",
    ticket.estaFueraSla ? "Sí" : "No",
    ticket.estaProximoAVencerSla ? "Sí" : "No",
  ]);

  return [encabezados, ...filas]
    .map((fila) => fila.map((valor) => escaparCsv(String(valor))).join(","))
    .join("\n");
}

export function descargarCsvReportes(tickets: TicketListado[]) {
  const csv = generarCsvReportes(tickets);
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = `reporte-tickets-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  URL.revokeObjectURL(url);
}

export function obtenerTecnico(ticket: TicketListado) {
  if (
    !ticket.tecnicoAsignado ||
    ticket.tecnicoAsignado.trim() === "" ||
    ticket.tecnicoAsignado === "No definido"
  ) {
    return SIN_ASIGNAR;
  }

  return ticket.tecnicoAsignado;
}

export function formatearPorcentaje(valor: number) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

function obtenerValoresUnicos(valores: string[]) {
  return Array.from(new Set(valores.map(normalizarLabel)))
    .filter((valor) => valor !== "")
    .sort((a, b) => a.localeCompare(b));
}

function cumpleFiltroTexto(valorActual: string, filtro: string) {
  if (!filtro) {
    return true;
  }

  return normalizarComparacion(valorActual) === normalizarComparacion(filtro);
}

function cumpleFiltroSla(ticket: TicketListado, filtro: ReporteSlaFiltro) {
  if (filtro === "todos") {
    return true;
  }

  if (filtro === "sin-sla") {
    return !tieneSla(ticket);
  }

  if (filtro === "fuera") {
    return tieneSla(ticket) && ticket.estaFueraSla;
  }

  if (filtro === "proximo") {
    return tieneSla(ticket) && ticket.estaProximoAVencerSla;
  }

  return tieneSla(ticket) && !ticket.estaFueraSla;
}

function cumpleRangoFechas(
  fechaTicket: string,
  fechaInicio: string,
  fechaFin: string
) {
  const fecha = crearFecha(fechaTicket);
  const inicio = fechaInicio ? crearFecha(`${fechaInicio}T00:00:00`) : null;
  const fin = fechaFin ? crearFecha(`${fechaFin}T23:59:59`) : null;

  if (!fecha) {
    return false;
  }

  if (inicio && fecha < inicio) {
    return false;
  }

  if (fin && fecha > fin) {
    return false;
  }

  return true;
}

function crearFecha(valor: string) {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return fecha;
}

function calcularPorcentaje(valor: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((valor / total) * 1000) / 10;
}

function normalizarLabel(valor: string) {
  if (!valor || valor.trim() === "" || valor === "No definido") {
    return "No definido";
  }

  return valor.trim();
}

function normalizarComparacion(valor: string) {
  return normalizarLabel(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function tieneSla(ticket: TicketListado) {
  return Boolean(ticket.fechaLimiteSla);
}

function esEstadoFinalizado(estado: string) {
  const estadoNormalizado = normalizarComparacion(estado);

  return (
    estadoNormalizado.includes("resuelto") ||
    estadoNormalizado.includes("cerrado")
  );
}

function esTicketSinAsignar(ticket: TicketListado) {
  return obtenerTecnico(ticket) === SIN_ASIGNAR;
}

function esPrioridadAltaOCritica(prioridad: string) {
  const prioridadNormalizada = normalizarComparacion(prioridad);

  return (
    prioridadNormalizada.includes("alta") ||
    prioridadNormalizada.includes("critica")
  );
}

function escaparCsv(valor: string) {
  const valorLimpio = valor.replace(/"/g, '""');

  return `"${valorLimpio}"`;
}