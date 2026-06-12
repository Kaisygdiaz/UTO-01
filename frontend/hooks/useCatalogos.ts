"use client";

import { useCallback, useEffect, useState } from "react";
import {
  actualizarCategoria,
  actualizarConfiguracionSla,
  actualizarMatrizPrioridad,
  actualizarPrioridad,
  cambiarEstadoCategoria,
  cambiarEstadoPrioridad,
  crearCategoria,
  crearPrioridad,
  obtenerBitacoraSistema,
  obtenerCategorias,
  obtenerConfiguracionSla,
  obtenerEstadosTicket,
  obtenerMatrizPrioridad,
  obtenerPrioridades,
  obtenerTecnicos,
} from "@/lib/catalogos";
import type {
  ActualizarConfiguracionSlaDto,
  BitacoraSistema,
  CategoriaCatalogo,
  ConfiguracionSla,
  CrearActualizarCategoriaDto,
  CrearActualizarPrioridadDto,
  EstadoTicketCatalogo,
  MatrizPrioridad,
  PrioridadCatalogo,
  TecnicoCatalogo,
} from "@/types/catalogos";

export function useCatalogos() {
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadCatalogo[]>([]);
  const [estadosTicket, setEstadosTicket] = useState<EstadoTicketCatalogo[]>(
    []
  );
  const [tecnicos, setTecnicos] = useState<TecnicoCatalogo[]>([]);
  const [matrizPrioridad, setMatrizPrioridad] = useState<MatrizPrioridad[]>(
    []
  );
  const [configuracionSla, setConfiguracionSla] =
    useState<ConfiguracionSla | null>(null);
  const [bitacoraSistema, setBitacoraSistema] = useState<BitacoraSistema[]>(
    []
  );

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const cargarCatalogos = useCallback(async (mostrarCarga = false) => {
    try {
      if (mostrarCarga) {
        setCargando(true);
      }

      setError("");

      const [
        categoriasData,
        prioridadesData,
        estadosData,
        tecnicosData,
        matrizData,
        configuracionSlaData,
        bitacoraData,
      ] = await Promise.all([
        obtenerCategorias(true),
        obtenerPrioridades(true),
        obtenerEstadosTicket(),
        obtenerTecnicos(),
        obtenerMatrizPrioridad(),
        obtenerConfiguracionSla(),
        obtenerBitacoraSistema(),
      ]);

      setCategorias(categoriasData);
      setPrioridades(prioridadesData);
      setEstadosTicket(estadosData);
      setTecnicos(tecnicosData);
      setMatrizPrioridad(matrizData);
      setConfiguracionSla(configuracionSlaData);
      setBitacoraSistema(bitacoraData);
    } catch {
      setError("No fue posible cargar la información de catálogos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos(true);
  }, [cargarCatalogos]);

  function limpiarMensajes() {
    setError("");
    setMensajeExito("");
  }

  async function guardarCategoria(
    id: number | null,
    dto: CrearActualizarCategoriaDto
  ) {
    try {
      setGuardando(true);
      limpiarMensajes();

      if (id) {
        await actualizarCategoria(id, dto);
        setMensajeExito("Categoría actualizada correctamente.");
      } else {
        await crearCategoria(dto);
        setMensajeExito("Categoría creada correctamente.");
      }

      await cargarCatalogos(false);
    } catch {
      setError("No fue posible guardar la categoría.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarActivoCategoria(id: number, activo: boolean) {
    try {
      setGuardando(true);
      limpiarMensajes();

      await cambiarEstadoCategoria(id, activo);
      setMensajeExito(
        activo
          ? "Categoría activada correctamente."
          : "Categoría inactivada correctamente."
      );

      await cargarCatalogos(false);
    } catch {
      setError("No fue posible cambiar el estado de la categoría.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarPrioridad(
    id: number | null,
    dto: CrearActualizarPrioridadDto
  ) {
    try {
      setGuardando(true);
      limpiarMensajes();

      if (id) {
        await actualizarPrioridad(id, dto);
        setMensajeExito("Prioridad actualizada correctamente.");
      } else {
        await crearPrioridad(dto);
        setMensajeExito("Prioridad creada correctamente.");
      }

      await cargarCatalogos(false);
    } catch {
      setError("No fue posible guardar la prioridad.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarActivoPrioridad(id: number, activo: boolean) {
    try {
      setGuardando(true);
      limpiarMensajes();

      await cambiarEstadoPrioridad(id, activo);
      setMensajeExito(
        activo
          ? "Prioridad activada correctamente."
          : "Prioridad inactivada correctamente."
      );

      await cargarCatalogos(false);
    } catch {
      setError("No fue posible cambiar el estado de la prioridad.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarMatrizPrioridad(id: number, prioridadId: number) {
    try {
      setGuardando(true);
      limpiarMensajes();

      await actualizarMatrizPrioridad(id, prioridadId);
      setMensajeExito("Matriz de prioridad actualizada correctamente.");

      await cargarCatalogos(false);
    } catch {
      setError("No fue posible actualizar la matriz de prioridad.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarConfiguracionSla(dto: ActualizarConfiguracionSlaDto) {
    try {
      setGuardando(true);
      limpiarMensajes();

      await actualizarConfiguracionSla(dto);
      setMensajeExito("Configuración SLA actualizada correctamente.");

      await cargarCatalogos(false);
    } catch {
      setError("No fue posible actualizar la configuración SLA.");
    } finally {
      setGuardando(false);
    }
  }

  return {
    categorias,
    prioridades,
    estadosTicket,
    tecnicos,
    matrizPrioridad,
    configuracionSla,
    bitacoraSistema,

    cargando,
    guardando,
    error,
    mensajeExito,

    cargarCatalogos: () => cargarCatalogos(false),
    limpiarMensajes,
    guardarCategoria,
    cambiarActivoCategoria,
    guardarPrioridad,
    cambiarActivoPrioridad,
    guardarMatrizPrioridad,
    guardarConfiguracionSla,
  };
}