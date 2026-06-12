"use client";

import ReportesDistribucionBarras from "@/components/reportes/ReportesDistribucionBarras";
import ReportesSlaComparativo from "@/components/reportes/ReportesSlaComparativo";
import type {
  ReporteDistribucionItem,
  ReporteSlaGrupo,
} from "@/types/reportes";

interface ReportesGraficasProps {
  porEstado: ReporteDistribucionItem[];
  porPrioridad: ReporteDistribucionItem[];
  porCategoria: ReporteDistribucionItem[];
  porTecnico: ReporteDistribucionItem[];
  slaPorTecnico: ReporteSlaGrupo[];
  slaPorCategoria: ReporteSlaGrupo[];
}

export default function ReportesGraficas({
  porCategoria,
  porTecnico,
  slaPorTecnico,
  slaPorCategoria,
}: ReportesGraficasProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <ReportesDistribucionBarras
          titulo="Porcentaje de tickets por categoría"
          descripcion="Identifica qué áreas o tipos de incidencia generan mayor demanda de soporte."
          items={porCategoria}
          tipo="categoria"
        />

        <ReportesDistribucionBarras
          titulo="Carga porcentual por técnico"
          descripcion="Muestra la distribución de trabajo asignada a cada responsable."
          items={porTecnico}
          tipo="tecnico"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReportesSlaComparativo
          titulo="Cumplimiento SLA por técnico"
          descripcion="Compara el porcentaje de cumplimiento e incumplimiento SLA por responsable."
          items={slaPorTecnico}
        />

        <ReportesSlaComparativo
          titulo="Cumplimiento SLA por categoría"
          descripcion="Compara el cumplimiento SLA según el tipo de incidencia reportada."
          items={slaPorCategoria}
        />
      </div>
    </div>
  );
}