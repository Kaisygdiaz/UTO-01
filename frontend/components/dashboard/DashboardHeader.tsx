import type { DashboardData } from "@/types/dashboard";
import { formatearFechaDashboard } from "@/utils/dashboardHelpers";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  dashboard: DashboardData | null;
  cargando: boolean;
  actualizando: boolean;
  onActualizar: () => void;
}

export default function DashboardHeader({
  dashboard,
  cargando,
  actualizando,
  onActualizar,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          Monitoreo operativo
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Visualización general de tickets, cumplimiento SLA, carga operativa y
          alertas de atención.
        </p>

        {dashboard?.fechaGeneracion && (
          <p className="mt-2 text-xs font-medium text-slate-400">
            Última actualización:{" "}
            {formatearFechaDashboard(dashboard.fechaGeneracion)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onActualizar}
        disabled={actualizando || cargando}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <RefreshCw className={`h-4 w-4 ${actualizando ? "animate-spin" : ""}`} />
        {actualizando ? "Actualizando..." : "Actualizar métricas"}
      </button>
    </div>
  );
}