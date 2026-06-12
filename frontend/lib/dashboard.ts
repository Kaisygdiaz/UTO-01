import { api } from "./api";
import type {
  DashboardData,
  DashboardPorCategoria,
  DashboardPorEstado,
  DashboardPorPrioridad,
  DashboardPorTecnico,
  DashboardTicketAlerta,
} from "@/types/dashboard";

function obtenerNumero(
  objeto: Record<string, unknown>,
  ...claves: string[]
): number {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "number") {
      return valor;
    }
  }

  return 0;
}

function obtenerTexto(
  objeto: Record<string, unknown>,
  ...claves: string[]
): string {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string") {
      return valor;
    }
  }

  return "";
}

function obtenerFechaONull(
  objeto: Record<string, unknown>,
  ...claves: string[]
): string | null {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor;
    }
  }

  return null;
}

function obtenerArray(
  objeto: Record<string, unknown>,
  ...claves: string[]
): Record<string, unknown>[] {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (Array.isArray(valor)) {
      return valor as Record<string, unknown>[];
    }
  }

  return [];
}

function mapearPorEstado(item: Record<string, unknown>): DashboardPorEstado {
  return {
    estado: obtenerTexto(item, "estado", "Estado"),
    total: obtenerNumero(item, "total", "Total"),
  };
}

function mapearPorPrioridad(
  item: Record<string, unknown>
): DashboardPorPrioridad {
  return {
    prioridad: obtenerTexto(item, "prioridad", "Prioridad"),
    total: obtenerNumero(item, "total", "Total"),
  };
}

function mapearPorCategoria(
  item: Record<string, unknown>
): DashboardPorCategoria {
  return {
    categoria: obtenerTexto(item, "categoria", "Categoria"),
    total: obtenerNumero(item, "total", "Total"),
  };
}

function mapearPorTecnico(item: Record<string, unknown>): DashboardPorTecnico {
  return {
    tecnico: obtenerTexto(item, "tecnico", "Tecnico"),
    total: obtenerNumero(item, "total", "Total"),
  };
}

function mapearTicketAlerta(
  item: Record<string, unknown>
): DashboardTicketAlerta {
  return {
    id: obtenerNumero(item, "id", "Id"),
    titulo: obtenerTexto(item, "titulo", "Titulo"),
    estado: obtenerTexto(item, "estado", "Estado"),
    prioridad: obtenerTexto(item, "prioridad", "Prioridad"),
    tecnicoAsignado: obtenerFechaONull(
      item,
      "tecnicoAsignado",
      "TecnicoAsignado"
    ),
    fechaCreacion: obtenerTexto(item, "fechaCreacion", "FechaCreacion"),
    fechaLimiteRespuesta: obtenerFechaONull(
      item,
      "fechaLimiteRespuesta",
      "FechaLimiteRespuesta"
    ),
    fechaLimiteResolucion: obtenerFechaONull(
      item,
      "fechaLimiteResolucion",
      "FechaLimiteResolucion"
    ),
    horasRestantesResolucion: obtenerNumero(
      item,
      "horasRestantesResolucion",
      "HorasRestantesResolucion"
    ),
    horasVencidasResolucion: obtenerNumero(
      item,
      "horasVencidasResolucion",
      "HorasVencidasResolucion"
    ),
    tipoAlerta: obtenerTexto(item, "tipoAlerta", "TipoAlerta"),
  };
}

export async function obtenerDashboard(): Promise<DashboardData> {
  const response = await api.get<Record<string, unknown>>("/Tickets/dashboard");
  const data = response.data;

  return {
    totalTickets: obtenerNumero(data, "totalTickets", "TotalTickets"),
    ticketsAbiertos: obtenerNumero(data, "ticketsAbiertos", "TicketsAbiertos"),
    ticketsEnProceso: obtenerNumero(
      data,
      "ticketsEnProceso",
      "TicketsEnProceso"
    ),
    ticketsEscalados: obtenerNumero(
      data,
      "ticketsEscalados",
      "TicketsEscalados"
    ),
    ticketsResueltos: obtenerNumero(
      data,
      "ticketsResueltos",
      "TicketsResueltos"
    ),
    ticketsCerrados: obtenerNumero(data, "ticketsCerrados", "TicketsCerrados"),
    ticketsCancelados: obtenerNumero(
      data,
      "ticketsCancelados",
      "TicketsCancelados"
    ),

    ticketsEvaluadosSla: obtenerNumero(
      data,
      "ticketsEvaluadosSla",
      "TicketsEvaluadosSla"
    ),
    ticketsExcluidosSla: obtenerNumero(
      data,
      "ticketsExcluidosSla",
      "TicketsExcluidosSla"
    ),
    ticketsVencidosRespuesta: obtenerNumero(
      data,
      "ticketsVencidosRespuesta",
      "TicketsVencidosRespuesta"
    ),
    ticketsVencidosResolucion: obtenerNumero(
      data,
      "ticketsVencidosResolucion",
      "TicketsVencidosResolucion"
    ),
    ticketsDentroSla: obtenerNumero(
      data,
      "ticketsDentroSla",
      "TicketsDentroSla"
    ),
    ticketsFueraSla: obtenerNumero(data, "ticketsFueraSla", "TicketsFueraSla"),
    porcentajeCumplimientoSla: obtenerNumero(
      data,
      "porcentajeCumplimientoSla",
      "PorcentajeCumplimientoSla"
    ),
    porcentajeIncumplimientoSla: obtenerNumero(
      data,
      "porcentajeIncumplimientoSla",
      "PorcentajeIncumplimientoSla"
    ),

    fechaGeneracion: obtenerFechaONull(
      data,
      "fechaGeneracion",
      "FechaGeneracion"
    ),

    porEstado: obtenerArray(data, "porEstado", "PorEstado").map(
      mapearPorEstado
    ),
    porPrioridad: obtenerArray(data, "porPrioridad", "PorPrioridad").map(
      mapearPorPrioridad
    ),
    porCategoria: obtenerArray(data, "porCategoria", "PorCategoria").map(
      mapearPorCategoria
    ),
    porTecnico: obtenerArray(data, "porTecnico", "PorTecnico").map(
      mapearPorTecnico
    ),

    ticketsVencidosDetalle: obtenerArray(
      data,
      "ticketsVencidosDetalle",
      "TicketsVencidosDetalle"
    ).map(mapearTicketAlerta),

    ticketsProximosAVencerDetalle: obtenerArray(
      data,
      "ticketsProximosAVencerDetalle",
      "TicketsProximosAVencerDetalle"
    ).map(mapearTicketAlerta),
  };
}