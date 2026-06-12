import type { ReporteResumen } from "@/types/reportes";
import { formatearPorcentaje } from "@/utils/reportesHelpers";
import Card from "@/components/ui/Card";
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  ShieldAlert,
  Ticket,
  UserMinus,
} from "lucide-react";

interface ReportesResumenProps {
  resumen: ReporteResumen;
}

export default function ReportesResumen({ resumen }: ReportesResumenProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <ResumenCard
        titulo="Tickets filtrados"
        valor={resumen.totalTickets}
        descripcion="Total considerado en el reporte"
        icono={<Ticket className="h-5 w-5" />}
        color="blue"
      />

      <ResumenCard
        titulo="Tasa de resolución"
        valor={`${formatearPorcentaje(resumen.tasaResolucion)}%`}
        descripcion={`${resumen.ticketsResueltosOCerrados} tickets resueltos o cerrados`}
        icono={<CheckCircle2 className="h-5 w-5" />}
        color="emerald"
      />

      <ResumenCard
        titulo="Cumplimiento SLA"
        valor={`${formatearPorcentaje(resumen.porcentajeCumplimientoSla)}%`}
        descripcion={`${resumen.ticketsEvaluadosSla} tickets evaluados por SLA`}
        icono={<Gauge className="h-5 w-5" />}
        color="blue"
      />

      <ResumenCard
        titulo="Fuera de SLA"
        valor={`${formatearPorcentaje(resumen.porcentajeFueraSla)}%`}
        descripcion={`${resumen.ticketsFueraSla} tickets incumplieron SLA`}
        icono={<AlertTriangle className="h-5 w-5" />}
        color="red"
      />

      <ResumenCard
        titulo="Sin asignar"
        valor={`${formatearPorcentaje(resumen.porcentajeSinAsignar)}%`}
        descripcion={`${resumen.ticketsSinAsignar} tickets sin responsable`}
        icono={<UserMinus className="h-5 w-5" />}
        color="amber"
      />

      <ResumenCard
        titulo="Alta criticidad"
        valor={`${formatearPorcentaje(resumen.porcentajeAltaCriticidad)}%`}
        descripcion={`${resumen.ticketsAltaCriticidad} tickets alta/crítica`}
        icono={<ShieldAlert className="h-5 w-5" />}
        color="purple"
      />
    </div>
  );
}

function ResumenCard({
  titulo,
  valor,
  descripcion,
  icono,
  color,
}: {
  titulo: string;
  valor: number | string;
  descripcion: string;
  icono: React.ReactNode;
  color: "blue" | "emerald" | "red" | "amber" | "purple";
}) {
  const estilos = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{valor}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {descripcion}
          </p>
        </div>

        <div className={`rounded-xl p-2 ${estilos[color]}`}>{icono}</div>
      </div>
    </Card>
  );
}