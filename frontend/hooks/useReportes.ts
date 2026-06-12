"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { obtenerTicketsParaReportes } from "@/lib/reportes";
import type { TicketListado } from "@/types/tickets";
import type { ReportesFiltros } from "@/types/reportes";
import {
  calcularDistribucion,
  calcularResumenReportes,
  calcularSlaPorGrupo,
  descargarCsvReportes,
  filtrarTicketsReportes,
  filtrosReportesIniciales,
  generarAnalisisReportes,
  generarOpcionesFiltros,
  obtenerTecnico,
} from "@/utils/reportesHelpers";

type ModoCarga = "inicial" | "actualizacion";

export function useReportes() {
  const [tickets, setTickets] = useState<TicketListado[]>([]);
  const [filtros, setFiltros] = useState<ReportesFiltros>(
    filtrosReportesIniciales
  );

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarReportes = useCallback(async (modo: ModoCarga = "inicial") => {
    try {
      if (modo === "inicial") {
        setCargando(true);
      } else {
        setActualizando(true);
      }

      setError("");

      const data = await obtenerTicketsParaReportes();
      setTickets(data);
    } catch {
      setError("No fue posible cargar la información para reportes.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes("inicial");
  }, [cargarReportes]);

  const ticketsFiltrados = useMemo(
    () => filtrarTicketsReportes(tickets, filtros),
    [tickets, filtros]
  );

  const opcionesFiltros = useMemo(
    () => generarOpcionesFiltros(tickets),
    [tickets]
  );

  const resumen = useMemo(
    () => calcularResumenReportes(ticketsFiltrados),
    [ticketsFiltrados]
  );

  const porEstado = useMemo(
    () => calcularDistribucion(ticketsFiltrados, (ticket) => ticket.estado),
    [ticketsFiltrados]
  );

  const porPrioridad = useMemo(
    () => calcularDistribucion(ticketsFiltrados, (ticket) => ticket.prioridad),
    [ticketsFiltrados]
  );

  const porCategoria = useMemo(
    () => calcularDistribucion(ticketsFiltrados, (ticket) => ticket.categoria),
    [ticketsFiltrados]
  );

  const porTecnico = useMemo(
    () => calcularDistribucion(ticketsFiltrados, obtenerTecnico),
    [ticketsFiltrados]
  );

  const slaPorTecnico = useMemo(
    () => calcularSlaPorGrupo(ticketsFiltrados, obtenerTecnico),
    [ticketsFiltrados]
  );

  const slaPorCategoria = useMemo(
    () => calcularSlaPorGrupo(ticketsFiltrados, (ticket) => ticket.categoria),
    [ticketsFiltrados]
  );

  const analisis = useMemo(
    () => generarAnalisisReportes(resumen),
    [resumen]
  );

  function actualizarFiltro<K extends keyof ReportesFiltros>(
    campo: K,
    valor: ReportesFiltros[K]
  ) {
    setFiltros((filtrosActuales) => ({
      ...filtrosActuales,
      [campo]: valor,
    }));
  }

  function limpiarFiltros() {
    setFiltros(filtrosReportesIniciales);
  }

  function exportarCsv() {
    descargarCsvReportes(ticketsFiltrados);
  }

  function imprimirReporte() {
    window.print();
  }

  return {
    tickets,
    ticketsFiltrados,
    filtros,
    opcionesFiltros,
    resumen,
    porEstado,
    porPrioridad,
    porCategoria,
    porTecnico,
    slaPorTecnico,
    slaPorCategoria,
    analisis,

    cargando,
    actualizando,
    error,

    actualizarFiltro,
    limpiarFiltros,
    exportarCsv,
    imprimirReporte,
    recargarReportes: () => cargarReportes("actualizacion"),
  };
}