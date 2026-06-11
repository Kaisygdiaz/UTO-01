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