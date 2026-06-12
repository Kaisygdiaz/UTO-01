import DashboardAlertTable from "@/components/dashboard/DashboardAlertTable";
import DashboardBarChart from "@/components/dashboard/DashboardBarChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardDonutChart from "@/components/dashboard/DashboardDonutChart";
import DashboardSlaSummary from "@/components/dashboard/DashboardSlaSummary";
import type { DashboardData } from "@/types/dashboard";
import {
  generarResumenOperativo,
  ordenarPorTotalDesc,
} from "@/utils/dashboardHelpers";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Gauge,
  Ticket,
  XCircle,
} from "lucide-react";

interface DashboardContentProps {
  dashboard: DashboardData;
}

export default function DashboardContent({ dashboard }: DashboardContentProps) {
  const resumenOperativo = generarResumenOperativo(
    dashboard.porcentajeCumplimientoSla,
    dashboard.ticketsFueraSla,
    dashboard.ticketsVencidosResolucion,
    dashboard.ticketsEscalados
  );

  return (
    <>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4">
        <p className="text-sm font-semibold text-blue-800">
          Análisis operativo
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-700">
          {resumenOperativo}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          titulo="Tickets totales"
          valor={dashboard.totalTickets}
          descripcion="Total de tickets registrados"
          icono={Ticket}
          iconColor="text-blue-600"
        />

        <DashboardCard
          titulo="Abiertos"
          valor={dashboard.ticketsAbiertos}
          descripcion="Pendientes de atención inicial"
          icono={Circle}
          iconColor="text-sky-600"
        />

        <DashboardCard
          titulo="En proceso"
          valor={dashboard.ticketsEnProceso}
          descripcion="Actualmente en atención"
          icono={Clock}
          iconColor="text-amber-600"
        />

        <DashboardCard
          titulo="Escalados"
          valor={dashboard.ticketsEscalados}
          descripcion="Requieren seguimiento superior"
          icono={AlertTriangle}
          iconColor="text-purple-600"
        />

        <DashboardCard
          titulo="Resueltos"
          valor={dashboard.ticketsResueltos}
          descripcion="Pendientes de cierre formal"
          icono={CheckCircle2}
          iconColor="text-emerald-600"
        />

        <DashboardCard
          titulo="Cerrados"
          valor={dashboard.ticketsCerrados}
          descripcion="Finalizados correctamente"
          icono={CheckCircle2}
          iconColor="text-slate-600"
        />

        <DashboardCard
          titulo="Cancelados"
          valor={dashboard.ticketsCancelados}
          descripcion="Anulados o no procedentes"
          icono={XCircle}
          iconColor="text-red-600"
        />

        <DashboardCard
          titulo="Fuera de SLA"
          valor={dashboard.ticketsFueraSla}
          descripcion="Superaron los tiempos permitidos"
          icono={Gauge}
          iconColor="text-red-600"
        />
      </div>

      <DashboardSlaSummary dashboard={dashboard} />

      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardDonutChart
          titulo="Distribución por prioridad"
          descripcion="Proporción de tickets según su nivel de criticidad."
          centroLabel="tickets"
          items={ordenarPorTotalDesc(dashboard.porPrioridad).map((item) => ({
            label: item.prioridad,
            total: item.total,
          }))}
        />

        <DashboardDonutChart
          titulo="Distribución por estado"
          descripcion="Vista general del flujo actual de atención."
          centroLabel="tickets"
          items={ordenarPorTotalDesc(dashboard.porEstado).map((item) => ({
            label: item.estado,
            total: item.total,
          }))}
        />

        <DashboardBarChart
          titulo="Tickets por categoría"
          descripcion="Áreas o tipos de incidencia más frecuentes."
          items={ordenarPorTotalDesc(dashboard.porCategoria).map((item) => ({
            label: item.categoria,
            total: item.total,
          }))}
        />

        <DashboardBarChart
          titulo="Carga por técnico"
          descripcion="Cantidad de tickets asignados por responsable."
          items={ordenarPorTotalDesc(dashboard.porTecnico).map((item) => ({
            label: item.tecnico,
            total: item.total,
          }))}
        />
      </div>

      <div className="grid gap-5">
        <DashboardAlertTable
          titulo="Tickets vencidos por SLA"
          descripcion="Tickets que superaron el tiempo de respuesta o resolución."
          tickets={dashboard.ticketsVencidosDetalle}
          tipo="vencidos"
        />

        <DashboardAlertTable
          titulo="Tickets próximos a vencer"
          descripcion="Tickets que requieren atención preventiva antes de incumplir SLA."
          tickets={dashboard.ticketsProximosAVencerDetalle}
          tipo="proximos"
        />
      </div>
    </>
  );
}