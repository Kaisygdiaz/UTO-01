"use client";

import AppLayout from "../AppLayout";
import ErrorMessage from "../ui/ErrorMessage";
import LoadingState from "../ui/LoadingState";
import ReportesFiltros from "./ReportesFiltros";
import ReportesGraficas from "./ReportesGraficas";
import ReportesResumen from "./ReportesResumen";
import ReportesTabla from "./ReportesTabla";
import { useReportes } from "../../hooks/useReportes";
import { BarChart3, Download, Printer, RefreshCw } from "lucide-react";

export default function ReportesContent() {
  const reportes = useReportes();

  return (
    <AppLayout>
      <section className="space-y-5">
        <div className="no-print flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Reportes estadísticos
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Reportes
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Análisis estadístico de tickets, carga de trabajo, distribución
              porcentual, cumplimiento SLA y respaldo detallado para toma de
              decisiones.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={reportes.exportarCsv}
              disabled={
                reportes.cargando || reportes.ticketsFiltrados.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>

            <button
              type="button"
              onClick={reportes.imprimirReporte}
              disabled={reportes.cargando}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>

            <button
              type="button"
              onClick={reportes.recargarReportes}
              disabled={reportes.cargando || reportes.actualizando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  reportes.actualizando ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
          </div>
        </div>

        <div className="no-print">
          <ReportesFiltros
            filtros={reportes.filtros}
            opciones={reportes.opcionesFiltros}
            cargando={reportes.cargando}
            onActualizarFiltro={reportes.actualizarFiltro}
            onLimpiar={reportes.limpiarFiltros}
          />
        </div>

        {reportes.cargando && (
          <LoadingState mensaje="Cargando reportes estadísticos..." />
        )}

        <ErrorMessage mensaje={reportes.error} />

        {!reportes.cargando && !reportes.error && (
          <div className="print-area space-y-5">
            <div className="print-header">
              <p className="print-subtitle">
                Sistema Web de Gestión de Incidentes Tecnológicos UTO
              </p>

              <h1>Reporte estadístico de incidentes tecnológicos</h1>

              <p>
                Generado el {new Date().toLocaleDateString("es-GT")} · Total de
                tickets incluidos:{" "}
                <strong>{reportes.ticketsFiltrados.length}</strong>
              </p>
            </div>

            <div className="print-analysis rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4">
              <div className="flex gap-3">
                <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                <div>
                  <p className="text-sm font-bold text-blue-800">
                    Análisis estadístico
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    {reportes.analisis}
                  </p>
                </div>
              </div>
            </div>

            <ReportesResumen resumen={reportes.resumen} />

            <ReportesGraficas
              porEstado={reportes.porEstado}
              porPrioridad={reportes.porPrioridad}
              porCategoria={reportes.porCategoria}
              porTecnico={reportes.porTecnico}
              slaPorTecnico={reportes.slaPorTecnico}
              slaPorCategoria={reportes.slaPorCategoria}
            />

            <ReportesTabla tickets={reportes.ticketsFiltrados} />
          </div>
        )}
      </section>
    </AppLayout>
  );
}