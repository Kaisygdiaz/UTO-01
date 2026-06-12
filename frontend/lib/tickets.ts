import { api } from "./api";
import type {
  AdjuntoTicket,
  BitacoraTicket,
  ComentarioTicket,
  TicketDetalle,
  TicketListado,
} from "@/types/tickets";

function obtenerTexto(objeto: Record<string, unknown>, ...claves: string[]): string {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor;
    }
  }

  return "No definido";
}

function obtenerTextoVacio(
  objeto: Record<string, unknown>,
  ...claves: string[]
): string {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor;
    }
  }

  return "";
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

function obtenerBooleano(
  objeto: Record<string, unknown>,
  ...claves: string[]
): boolean {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "boolean") {
      return valor;
    }
  }

  return false;
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

function mapearTicket(item: Record<string, unknown>): TicketListado {
  return {
    id: obtenerNumero(item, "Id", "id"),
    titulo: obtenerTexto(item, "Titulo", "titulo"),
    descripcion: obtenerTexto(item, "Descripcion", "descripcion"),
    estado: obtenerTexto(item, "Estado", "estado"),
    prioridad: obtenerTexto(item, "Prioridad", "prioridad"),
    categoria: obtenerTexto(item, "Categoria", "categoria"),
    solicitante: obtenerTexto(item, "UsuarioSolicitante", "usuarioSolicitante"),
    tecnicoAsignado: obtenerTexto(item, "TecnicoAsignado", "tecnicoAsignado"),
    fechaCreacion: obtenerTexto(item, "FechaCreacion", "fechaCreacion"),

    // Este dato no viene actualmente en GET /api/Tickets.
    fechaLimiteSla: null,

    // Estos campos solo se usarán si el backend los envía.
    estaFueraSla: obtenerBooleano(item, "EstaFueraSla", "estaFueraSla"),
    estaProximoAVencerSla: obtenerBooleano(
      item,
      "EstaProximoAVencerSla",
      "estaProximoAVencerSla"
    ),
  };
}

function mapearTicketDetalle(item: Record<string, unknown>): TicketDetalle {
  const ticket = mapearTicket(item);

  return {
    ...ticket,
    impacto: obtenerTexto(item, "Impacto", "impacto"),
    urgencia: obtenerTexto(item, "Urgencia", "urgencia"),
    solucion: obtenerTextoVacio(item, "Solucion", "solucion"),
    comentarioCierre: obtenerTextoVacio(
      item,
      "ComentarioCierre",
      "comentarioCierre"
    ),
    calificacionSatisfaccion: obtenerNumero(
      item,
      "CalificacionSatisfaccion",
      "calificacionSatisfaccion"
    ),
    motivoEscalamiento: obtenerTextoVacio(
      item,
      "MotivoEscalamiento",
      "motivoEscalamiento"
    ),
    fechaEscalamiento: obtenerFechaONull(
      item,
      "FechaEscalamiento",
      "fechaEscalamiento"
    ),
    motivoCancelacion: obtenerTextoVacio(
      item,
      "MotivoCancelacion",
      "motivoCancelacion"
    ),
    fechaCancelacion: obtenerFechaONull(
      item,
      "FechaCancelacion",
      "fechaCancelacion"
    ),
    motivoReapertura: obtenerTextoVacio(
      item,
      "MotivoReapertura",
      "motivoReapertura"
    ),
    fechaReapertura: obtenerFechaONull(
      item,
      "FechaReapertura",
      "fechaReapertura"
    ),
    fechaPrimeraRespuesta: obtenerFechaONull(
      item,
      "FechaPrimeraRespuesta",
      "fechaPrimeraRespuesta"
    ),
    fechaResolucion: obtenerFechaONull(
      item,
      "FechaResolucion",
      "fechaResolucion"
    ),
    fechaCierre: obtenerFechaONull(item, "FechaCierre", "fechaCierre"),
  };
}

function mapearBitacora(item: Record<string, unknown>): BitacoraTicket {
  return {
    id: obtenerNumero(item, "Id", "id"),
    accion: obtenerTexto(item, "Accion", "accion"),
    detalle: obtenerTexto(item, "Detalle", "detalle"),
    usuario: obtenerTexto(item, "Usuario", "usuario"),
    fechaRegistro: obtenerTexto(item, "FechaRegistro", "fechaRegistro"),
  };
}

function mapearComentario(item: Record<string, unknown>): ComentarioTicket {
  return {
    id: obtenerNumero(item, "Id", "id"),
    ticketId: obtenerNumero(item, "TicketId", "ticketId"),
    usuario: obtenerTexto(item, "Usuario", "usuario"),
    rol: obtenerTexto(item, "Rol", "rol"),
    comentario: obtenerTexto(item, "Comentario", "comentario"),
    esInterno: obtenerBooleano(item, "EsInterno", "esInterno"),
    tipoComentario: obtenerTexto(item, "TipoComentario", "tipoComentario"),
    fechaRegistro: obtenerTexto(item, "FechaRegistro", "fechaRegistro"),
  };
}

function mapearAdjunto(item: Record<string, unknown>): AdjuntoTicket {
  return {
    id: obtenerNumero(item, "Id", "id"),
    ticketId: obtenerNumero(item, "TicketId", "ticketId"),
    nombreArchivoOriginal: obtenerTexto(
      item,
      "NombreArchivoOriginal",
      "nombreArchivoOriginal"
    ),
    tipoContenido: obtenerTexto(item, "TipoContenido", "tipoContenido"),
    tamanoBytes: obtenerNumero(item, "TamanoBytes", "tamanoBytes"),
    descripcion: obtenerFechaONull(item, "Descripcion", "descripcion"),
    usuario: obtenerTexto(item, "Usuario", "usuario"),
    fechaCarga: obtenerTexto(item, "FechaCarga", "fechaCarga"),
  };
}

export async function obtenerTickets(): Promise<TicketListado[]> {
  const response = await api.get<unknown>("/Tickets");

  if (Array.isArray(response.data)) {
    return response.data.map((item) =>
      mapearTicket(item as Record<string, unknown>)
    );
  }

  const data = response.data as Record<string, unknown>;

  if (Array.isArray(data.tickets)) {
    return data.tickets.map((item) =>
      mapearTicket(item as Record<string, unknown>)
    );
  }

  return [];
}

export async function obtenerTicketPorId(id: number): Promise<TicketDetalle> {
  const response = await api.get<Record<string, unknown>>(`/Tickets/${id}`);

  return mapearTicketDetalle(response.data);
}

export async function obtenerBitacoraTicket(
  id: number
): Promise<BitacoraTicket[]> {
  const response = await api.get<unknown>(`/Tickets/${id}/bitacora`);

  if (Array.isArray(response.data)) {
    return response.data.map((item) =>
      mapearBitacora(item as Record<string, unknown>)
    );
  }

  return [];
}

export async function obtenerComentariosTicket(
  id: number
): Promise<ComentarioTicket[]> {
  const response = await api.get<unknown>(`/Tickets/${id}/comentarios`);

  if (Array.isArray(response.data)) {
    return response.data.map((item) =>
      mapearComentario(item as Record<string, unknown>)
    );
  }

  return [];
}

export async function obtenerAdjuntosTicket(
  ticketId: number
): Promise<AdjuntoTicket[]> {
  const response = await api.get<unknown>(`/Tickets/${ticketId}/adjuntos`);

  if (Array.isArray(response.data)) {
    return response.data.map((item) =>
      mapearAdjunto(item as Record<string, unknown>)
    );
  }

  const data = response.data as Record<string, unknown>;

  if (Array.isArray(data.adjuntos)) {
    return data.adjuntos.map((item) =>
      mapearAdjunto(item as Record<string, unknown>)
    );
  }

  return [];
}

export function obtenerUrlDescargaAdjunto(ticketId: number, adjuntoId: number) {
  return `/Tickets/${ticketId}/adjuntos/${adjuntoId}/descargar`;
}