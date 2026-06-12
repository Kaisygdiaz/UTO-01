export interface TicketListado {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: string;
  solicitante: string;
  tecnicoAsignado: string;
  fechaCreacion: string;
  fechaLimiteSla: string | null;
  estaFueraSla: boolean;
  estaProximoAVencerSla: boolean;
}

export interface TicketDetalle extends TicketListado {
  impacto: string;
  urgencia: string;
  solucion: string;
  comentarioCierre: string;
  calificacionSatisfaccion: number;
  motivoEscalamiento: string;
  fechaEscalamiento: string | null;
  motivoCancelacion: string;
  fechaCancelacion: string | null;
  motivoReapertura: string;
  fechaReapertura: string | null;
  fechaPrimeraRespuesta: string | null;
  fechaResolucion: string | null;
  fechaCierre: string | null;
}

export interface BitacoraTicket {
  id: number;
  accion: string;
  detalle: string;
  usuario: string;
  fechaRegistro: string;
}

export interface ComentarioTicket {
  id: number;
  ticketId: number;
  usuario: string;
  rol: string;
  comentario: string;
  esInterno: boolean;
  tipoComentario: string;
  fechaRegistro: string;
}

export interface AdjuntoTicket {
  id: number;
  ticketId: number;
  nombreArchivoOriginal: string;
  tipoContenido: string;
  tamanoBytes: number;
  descripcion: string | null;
  usuario: string;
  fechaCarga: string;
}