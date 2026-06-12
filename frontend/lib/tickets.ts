import { api } from "./api";
import type {
  AdjuntoTicket,
  BitacoraTicket,
  ComentarioTicket,
  TicketDetalle,
  TicketListado,
} from "@/types/tickets";

function obtenerTexto(
  objeto: Record<string, unknown>,
  ...claves: string[]
): string {
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
    solicitante: obtenerTexto(
      item,
      "UsuarioSolicitante",
      "usuarioSolicitante",
      "Solicitante",
      "solicitante"
    ),
    tecnicoAsignado: obtenerTexto(
      item,
      "TecnicoAsignado",
      "tecnicoAsignado"
    ),
    fechaCreacion: obtenerTexto(item, "FechaCreacion", "fechaCreacion"),

    fechaLimiteSla: obtenerFechaONull(
      item,
      "FechaLimiteSla",
      "fechaLimiteSla",
      "FechaLimiteSLA",
      "fechaLimiteSLA"
    ),

    estaFueraSla: obtenerBooleano(
      item,
      "EstaFueraSla",
      "estaFueraSla",
      "EstaFueraSLA",
      "estaFueraSLA"
    ),

    estaProximoAVencerSla: obtenerBooleano(
      item,
      "EstaProximoAVencerSla",
      "estaProximoAVencerSla",
      "EstaProximoAVencerSLA",
      "estaProximoAVencerSLA"
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

    tiempoRespuestaHoras: obtenerNumero(
      item,
      "TiempoRespuestaHoras",
      "tiempoRespuestaHoras"
    ),

    tiempoResolucionHoras: obtenerNumero(
      item,
      "TiempoResolucionHoras",
      "tiempoResolucionHoras"
    ),

    fechaLimiteSla: obtenerFechaONull(
      item,
      "FechaLimiteSla",
      "fechaLimiteSla",
      "FechaLimiteSLA",
      "fechaLimiteSLA"
    ),

    estaFueraSla: obtenerBooleano(
      item,
      "EstaFueraSla",
      "estaFueraSla",
      "EstaFueraSLA",
      "estaFueraSLA"
    ),

    estaProximoAVencerSla: obtenerBooleano(
      item,
      "EstaProximoAVencerSla",
      "estaProximoAVencerSla",
      "EstaProximoAVencerSLA",
      "estaProximoAVencerSLA"
    ),
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

  const data = response.data as Record<string, unknown>;

  if (Array.isArray(data.comentarios)) {
    return data.comentarios.map((item) =>
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

export interface CrearComentarioTicketRequest {
  comentario: string;
  esInterno: boolean;
}

export async function crearComentarioTicket(
  ticketId: number,
  datos: CrearComentarioTicketRequest
): Promise<ComentarioTicket> {
  const response = await api.post<Record<string, unknown>>(
    `/Tickets/${ticketId}/comentarios`,
    datos
  );

  const data = response.data;

  if (data.comentario && typeof data.comentario === "object") {
    return mapearComentario(data.comentario as Record<string, unknown>);
  }

  return mapearComentario(data);
}

export interface SubirAdjuntoTicketRequest {
  archivo: File;
  descripcion?: string;
}

export async function subirAdjuntoTicket(
  ticketId: number,
  datos: SubirAdjuntoTicketRequest
): Promise<AdjuntoTicket> {
  const formData = new FormData();

  formData.append("archivo", datos.archivo);

  if (datos.descripcion && datos.descripcion.trim() !== "") {
    formData.append("descripcion", datos.descripcion.trim());
  }

  const response = await api.post<Record<string, unknown>>(
    `/Tickets/${ticketId}/adjuntos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const data = response.data;

  if (data.adjunto && typeof data.adjunto === "object") {
    return mapearAdjunto(data.adjunto as Record<string, unknown>);
  }

  return mapearAdjunto(data);
}

export interface AsignarTicketRequest {
  tecnicoId: number;
}

export async function asignarTicket(
  ticketId: number,
  datos: AsignarTicketRequest
): Promise<void> {
  await api.put(`/Tickets/${ticketId}/asignar`, datos);
}

export interface ResolverTicketRequest {
  solucion: string;
}

export interface CerrarTicketRequest {
  comentarioCierre: string;
  calificacionSatisfaccion?: number;
}

export interface ReabrirTicketRequest {
  motivoReapertura: string;
}

export interface CancelarTicketRequest {
  motivoCancelacion: string;
}

export interface EscalarTicketRequest {
  motivoEscalamiento: string;
}

export async function resolverTicket(
  ticketId: number,
  datos: ResolverTicketRequest
): Promise<void> {
  await api.put(`/Tickets/${ticketId}/resolver`, datos);
}

export async function cerrarTicket(
  ticketId: number,
  datos: CerrarTicketRequest
): Promise<void> {
  await api.put(`/Tickets/${ticketId}/cerrar`, datos);
}

export async function reabrirTicket(
  ticketId: number,
  datos: ReabrirTicketRequest
): Promise<void> {
  await api.put(`/Tickets/${ticketId}/reabrir`, datos);
}

export async function cancelarTicket(
  ticketId: number,
  datos: CancelarTicketRequest
): Promise<void> {
  await api.put(`/Tickets/${ticketId}/cancelar`, datos);
}

export async function escalarTicket(
  ticketId: number,
  datos: EscalarTicketRequest
): Promise<void> {
  await api.put(`/Tickets/${ticketId}/escalar`, datos);
}

export interface CrearTicketRequest {
  titulo: string;
  descripcion: string;
  categoriaId: number;
  impacto: string;
  urgencia: string;
}

export async function crearTicket(
  datos: CrearTicketRequest
): Promise<TicketDetalle> {
  const response = await api.post<Record<string, unknown>>("/Tickets", datos);

  const data = response.data;

  if (data.ticket && typeof data.ticket === "object") {
    return mapearTicketDetalle(data.ticket as Record<string, unknown>);
  }

  return mapearTicketDetalle(data);
}