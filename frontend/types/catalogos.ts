export interface CategoriaCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}

export interface PrioridadCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
  activo: boolean;
  fechaActualizacion: string | null;
}

export interface EstadoTicketCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface TecnicoCatalogo {
  id: number;
  nombreCompleto: string;
  correo: string;
}

export interface MatrizPrioridad {
  id: number;
  impacto: string;
  urgencia: string;
  prioridadId: number;
  prioridad: string;
  activo: boolean;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}

export interface ConfiguracionSla {
  id: number;
  habilitado: boolean;
  intervaloRevisionMinutos: number;
  porcentajeProximoVencimiento: number;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
  actualizadoPor: string | null;
}

export interface BitacoraSistema {
  id: number;
  usuario: string;
  correoUsuario: string;
  modulo: string;
  accion: string;
  detalle: string;
  fechaRegistro: string;
}

export interface BitacoraSistemaResponse {
  total: number;
  registros: BitacoraSistema[];
}

export interface CrearActualizarCategoriaDto {
  nombre: string;
  descripcion: string | null;
}

export interface CrearActualizarPrioridadDto {
  nombre: string;
  descripcion: string | null;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

export interface CambiarEstadoCatalogoDto {
  activo: boolean;
}

export interface ActualizarMatrizPrioridadDto {
  prioridadId: number;
}

export interface ActualizarConfiguracionSlaDto {
  habilitado: boolean;
  intervaloRevisionMinutos: number;
  porcentajeProximoVencimiento: number;
}