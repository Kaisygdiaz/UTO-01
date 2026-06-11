import { api } from "./api";
import type { TicketListado } from "@/types/tickets";

function obtenerTexto(objeto: Record<string, unknown>, ...claves: string[]): string {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor;
    }
  }

  return "No definido";
}

function obtenerNumero(objeto: Record<string, unknown>, ...claves: string[]): number {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "number") {
      return valor;
    }
  }

  return 0;
}

function obtenerBooleano(objeto: Record<string, unknown>, ...claves: string[]): boolean {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "boolean") {
      return valor;
    }
  }

  return false;
}

function obtenerFechaONull(objeto: Record<string, unknown>, ...claves: string[]): string | null {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor;
    }
  }

  return null;
}

function mapearTicket(item: Record<string, unknown>): TicketListado {
  return {
    id: obtenerNumero(item, "id", "ticketId", "Id", "TicketId"),
    titulo: obtenerTexto(item, "titulo", "Titulo"),
    descripcion: obtenerTexto(item, "descripcion", "Descripcion"),
    estado: obtenerTexto(item, "estado", "nombreEstado", "Estado", "NombreEstado"),
    prioridad: obtenerTexto(item, "prioridad", "nombrePrioridad", "Prioridad", "NombrePrioridad"),
    categoria: obtenerTexto(item, "categoria", "nombreCategoria", "Categoria", "NombreCategoria"),
    solicitante: obtenerTexto(item, "solicitante", "nombreSolicitante", "Solicitante", "NombreSolicitante"),
    tecnicoAsignado: obtenerTexto(
      item,
      "tecnicoAsignado",
      "nombreTecnicoAsignado",
      "TecnicoAsignado",
      "NombreTecnicoAsignado"
    ),
    fechaCreacion: obtenerTexto(item, "fechaCreacion", "FechaCreacion"),
    fechaLimiteSla: obtenerFechaONull(item, "fechaLimiteSla", "FechaLimiteSla"),
    estaFueraSla: obtenerBooleano(item, "estaFueraSla", "EstaFueraSla"),
    estaProximoAVencerSla: obtenerBooleano(
      item,
      "estaProximoAVencerSla",
      "EstaProximoAVencerSla"
    ),
  };
}

export async function obtenerTickets(): Promise<TicketListado[]> {
  const response = await api.get<unknown>("/Tickets");

  if (Array.isArray(response.data)) {
    return response.data.map((item) => mapearTicket(item as Record<string, unknown>));
  }

  const data = response.data as Record<string, unknown>;

  if (Array.isArray(data.items)) {
    return data.items.map((item) => mapearTicket(item as Record<string, unknown>));
  }

  if (Array.isArray(data.tickets)) {
    return data.tickets.map((item) => mapearTicket(item as Record<string, unknown>));
  }

  if (Array.isArray(data.data)) {
    return data.data.map((item) => mapearTicket(item as Record<string, unknown>));
  }

  return [];
}