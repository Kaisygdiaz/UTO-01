export interface DashboardPorEstado {
  estado: string;
  total: number;
}

export interface DashboardPorPrioridad {
  prioridad: string;
  total: number;
}

export interface DashboardPorCategoria {
  categoria: string;
  total: number;
}

export interface DashboardPorTecnico {
  tecnico: string;
  total: number;
}

export interface DashboardTicketAlerta {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado: string | null;
  fechaCreacion: string;
  fechaLimiteRespuesta: string | null;
  fechaLimiteResolucion: string | null;
  horasRestantesResolucion: number;
  horasVencidasResolucion: number;
  tipoAlerta: string;
}

export interface DashboardData {
  totalTickets: number;

  ticketsAbiertos: number;
  ticketsEnProceso: number;
  ticketsEscalados: number;
  ticketsResueltos: number;
  ticketsCerrados: number;
  ticketsCancelados: number;

  ticketsEvaluadosSla: number;
  ticketsExcluidosSla: number;
  ticketsVencidosRespuesta: number;
  ticketsVencidosResolucion: number;
  ticketsDentroSla: number;
  ticketsFueraSla: number;

  porcentajeCumplimientoSla: number;
  porcentajeIncumplimientoSla: number;

  fechaGeneracion: string | null;

  porEstado: DashboardPorEstado[];
  porPrioridad: DashboardPorPrioridad[];
  porCategoria: DashboardPorCategoria[];
  porTecnico: DashboardPorTecnico[];

  ticketsVencidosDetalle: DashboardTicketAlerta[];
  ticketsProximosAVencerDetalle: DashboardTicketAlerta[];
}