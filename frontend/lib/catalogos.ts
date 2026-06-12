import { api } from "./api";
import type {
  ActualizarConfiguracionSlaDto,
  ActualizarMatrizPrioridadDto,
  BitacoraSistemaResponse,
  CambiarEstadoCatalogoDto,
  CategoriaCatalogo,
  ConfiguracionSla,
  CrearActualizarCategoriaDto,
  CrearActualizarPrioridadDto,
  EstadoTicketCatalogo,
  MatrizPrioridad,
  PrioridadCatalogo,
  TecnicoCatalogo,
} from "@/types/catalogos";

export const impactosDisponibles = ["Bajo", "Medio", "Alto"];

export const urgenciasDisponibles = ["Baja", "Media", "Alta"];

/* CATEGORÍAS */

export async function obtenerCategorias(incluirInactivos = true) {
  const response = await api.get<CategoriaCatalogo[]>(
    "/Catalogos/categorias",
    {
      params: { incluirInactivos },
    }
  );

  return response.data;
}

export async function crearCategoria(dto: CrearActualizarCategoriaDto) {
  const response = await api.post("/Catalogos/categorias", dto);
  return response.data;
}

export async function actualizarCategoria(
  id: number,
  dto: CrearActualizarCategoriaDto
) {
  const response = await api.put(`/Catalogos/categorias/${id}`, dto);
  return response.data;
}

export async function cambiarEstadoCategoria(id: number, activo: boolean) {
  const dto: CambiarEstadoCatalogoDto = { activo };

  const response = await api.put(`/Catalogos/categorias/${id}/estado`, dto);

  return response.data;
}

/* PRIORIDADES */

export async function obtenerPrioridades(incluirInactivos = true) {
  const response = await api.get<PrioridadCatalogo[]>(
    "/Catalogos/prioridades",
    {
      params: { incluirInactivos },
    }
  );

  return response.data;
}

export async function crearPrioridad(dto: CrearActualizarPrioridadDto) {
  const response = await api.post("/Catalogos/prioridades", dto);
  return response.data;
}

export async function actualizarPrioridad(
  id: number,
  dto: CrearActualizarPrioridadDto
) {
  const response = await api.put(`/Catalogos/prioridades/${id}`, dto);
  return response.data;
}

export async function cambiarEstadoPrioridad(id: number, activo: boolean) {
  const dto: CambiarEstadoCatalogoDto = { activo };

  const response = await api.put(`/Catalogos/prioridades/${id}/estado`, dto);

  return response.data;
}

/* ESTADOS Y TÉCNICOS */

export async function obtenerEstadosTicket() {
  const response = await api.get<EstadoTicketCatalogo[]>(
    "/Catalogos/estados-ticket"
  );

  return response.data;
}

export async function obtenerTecnicos() {
  const response = await api.get<TecnicoCatalogo[]>("/Catalogos/tecnicos");

  return response.data;
}

/* MATRIZ PRIORIDAD */

export async function obtenerMatrizPrioridad() {
  const response = await api.get<MatrizPrioridad[]>(
    "/Catalogos/matriz-prioridad"
  );

  return response.data;
}

export async function actualizarMatrizPrioridad(
  id: number,
  prioridadId: number
) {
  const dto: ActualizarMatrizPrioridadDto = { prioridadId };

  const response = await api.put(`/Catalogos/matriz-prioridad/${id}`, dto);

  return response.data;
}

/* CONFIGURACIÓN SLA */

export async function obtenerConfiguracionSla() {
  const response = await api.get<ConfiguracionSla>(
    "/Catalogos/configuracion-sla"
  );

  return response.data;
}

export async function actualizarConfiguracionSla(
  dto: ActualizarConfiguracionSlaDto
) {
  const response = await api.put("/Catalogos/configuracion-sla", dto);

  return response.data;
}

/* BITÁCORA DEL SISTEMA */

export async function obtenerBitacoraSistema() {
  const response = await api.get<BitacoraSistemaResponse>(
    "/Catalogos/bitacora-sistema"
  );

  return response.data.registros ?? [];
}