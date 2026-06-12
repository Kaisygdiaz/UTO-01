import Card from "@/components/ui/Card";
import type { DashboardData } from "@/types/dashboard";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface DashboardSlaSummaryProps {
  dashboard: DashboardData;
}

export default function DashboardSlaSummary({
  dashboard,
}: DashboardSlaSummaryProps) {
  const cumplimiento = redondear(dashboard.porcentajeCumplimientoSla);
  const incumplimiento = redondear(dashboard.porcentajeIncumplimientoSla);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          Análisis SLA
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Cumplimiento del nivel de servicio
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Resumen de tickets evaluados, vencidos y atendidos dentro del tiempo
          establecido.
        </p>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <DonutChart porcentaje={cumplimiento} />

          <div className="mt-5 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Cumplimiento SLA
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {cumplimiento}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Incumplimiento: {incumplimiento}%
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SlaBox
            titulo="Tickets evaluados"
            valor={dashboard.ticketsEvaluadosSla}
            descripcion="Tickets considerados para medición SLA"
            icono={<Clock className="h-5 w-5" />}
            color="blue"
          />

          <SlaBox
            titulo="Dentro de SLA"
            valor={dashboard.ticketsDentroSla}
            descripcion="Atendidos dentro del tiempo permitido"
            icono={<CheckCircle2 className="h-5 w-5" />}
            color="emerald"
          />

          <SlaBox
            titulo="Fuera de SLA"
            valor={dashboard.ticketsFueraSla}
            descripcion="Superaron el tiempo de atención definido"
            icono={<AlertTriangle className="h-5 w-5" />}
            color="red"
          />

          <SlaBox
            titulo="Excluidos SLA"
            valor={dashboard.ticketsExcluidosSla}
            descripcion="Tickets no considerados en la evaluación"
            icono={<ShieldAlert className="h-5 w-5" />}
            color="slate"
          />

          <SlaBox
            titulo="Vencidos respuesta"
            valor={dashboard.ticketsVencidosRespuesta}
            descripcion="Incumplieron el primer tiempo de respuesta"
            icono={<AlertTriangle className="h-5 w-5" />}
            color="amber"
          />

          <SlaBox
            titulo="Vencidos resolución"
            valor={dashboard.ticketsVencidosResolucion}
            descripcion="Incumplieron el tiempo máximo de solución"
            icono={<AlertTriangle className="h-5 w-5" />}
            color="red"
          />
        </div>
      </div>
    </Card>
  );
}

function DonutChart({ porcentaje }: { porcentaje: number }) {
  const radio = 44;
  const circunferencia = 2 * Math.PI * radio;
  const avance = (porcentaje / 100) * circunferencia;
  const restante = circunferencia - avance;

  return (
    <div className="relative h-44 w-44">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radio}
          strokeWidth="14"
          className="fill-none stroke-red-100"
        />

        <circle
          cx="60"
          cy="60"
          r={radio}
          strokeWidth="14"
          strokeLinecap="round"
          className="fill-none stroke-emerald-500"
          strokeDasharray={`${avance} ${restante}`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">
          {porcentaje}%
        </span>
        <span className="text-xs font-medium text-slate-500">SLA</span>
      </div>
    </div>
  );
}

interface SlaBoxProps {
  titulo: string;
  valor: number;
  descripcion: string;
  icono: React.ReactNode;
  color: "blue" | "emerald" | "red" | "amber" | "slate";
}

function SlaBox({ titulo, valor, descripcion, icono, color }: SlaBoxProps) {
  const estilos = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-600">{titulo}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{valor}</p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {descripcion}
          </p>
        </div>

        <div className={`rounded-xl p-2 ${estilos[color]}`}>{icono}</div>
      </div>
    </div>
  );
}

function redondear(valor: number) {
  return Math.round(valor * 100) / 100;
}