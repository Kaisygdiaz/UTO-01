"use client";

import Card from "../ui/Card";
import type { ReporteSlaGrupo } from "../../types/reportes";
import { formatearPorcentaje } from "../../utils/reportesHelpers";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReportesSlaComparativoProps {
  titulo: string;
  descripcion: string;
  items: ReporteSlaGrupo[];
}

interface SlaComparativoItem {
  nombre: string;
  dentro: number;
  fuera: number;
  sinSla: number;
  total: number;
  evaluados: number;
  dentroCantidad: number;
  fueraCantidad: number;
  sinSlaCantidad: number;
  proximoAVencer: number;
}

export default function ReportesSlaComparativo({
  titulo,
  descripcion,
  items,
}: ReportesSlaComparativoProps) {
  const data = prepararDatos(items);
  const peorCumplimiento = obtenerPeorCumplimiento(data);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>

      {data.length === 0 ? (
        <EstadoVacio />
      ) : (
        <div className="px-5 py-5">
          {peorCumplimiento && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                Mayor riesgo SLA
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {peorCumplimiento.nombre}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Presenta{" "}
                <strong>
                  {formatearPorcentaje(peorCumplimiento.fuera)}%
                </strong>{" "}
                fuera de SLA ({peorCumplimiento.fueraCantidad} tickets).
              </p>
            </div>
          )}

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 35, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={130}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip content={<TooltipSla />} />

                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />

                <Bar
                  dataKey="dentro"
                  name="Dentro de SLA"
                  stackId="sla"
                  fill="#10b981"
                  radius={[8, 0, 0, 8]}
                  barSize={24}
                />

                <Bar
                  dataKey="fuera"
                  name="Fuera de SLA"
                  stackId="sla"
                  fill="#ef4444"
                  barSize={24}
                />

                <Bar
                  dataKey="sinSla"
                  name="Sin SLA"
                  stackId="sla"
                  fill="#64748b"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 space-y-3">
            {data.map((item) => (
              <ResumenSlaItem key={item.nombre} item={item} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function TooltipSla({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    payload: SlaComparativoItem;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-lg">
      <p className="mb-2 font-bold text-slate-900">{label}</p>

      <p className="text-emerald-700">
        Dentro de SLA:{" "}
        <strong>
          {item.dentroCantidad} · {formatearPorcentaje(item.dentro)}%
        </strong>
      </p>

      <p className="text-red-700">
        Fuera de SLA:{" "}
        <strong>
          {item.fueraCantidad} · {formatearPorcentaje(item.fuera)}%
        </strong>
      </p>

      <p className="text-slate-700">
        Sin SLA:{" "}
        <strong>
          {item.sinSlaCantidad} · {formatearPorcentaje(item.sinSla)}%
        </strong>
      </p>

      <p className="mt-2 text-slate-500">
        Próximos a vencer: <strong>{item.proximoAVencer}</strong>
      </p>

      <p className="text-slate-500">
        Total: <strong>{item.total}</strong>
      </p>
    </div>
  );
}

function ResumenSlaItem({ item }: { item: SlaComparativoItem }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            {item.nombre}
          </p>

          <p className="text-xs text-slate-500">
            {item.total} tickets · {item.evaluados} evaluados SLA
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            {formatearPorcentaje(item.dentro)}% dentro
          </span>

          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
            {formatearPorcentaje(item.fuera)}% fuera
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {formatearPorcentaje(item.sinSla)}% sin SLA
          </span>
        </div>
      </div>
    </div>
  );
}

function EstadoVacio() {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-5 py-8 text-sm text-slate-500">
      No hay datos para mostrar.
    </div>
  );
}

function prepararDatos(items: ReporteSlaGrupo[]): SlaComparativoItem[] {
  return items
    .filter((item) => item.total > 0)
    .map((item) => ({
      nombre: item.label,
      dentro: calcularPorcentaje(item.dentroSla, item.total),
      fuera: calcularPorcentaje(item.fueraSla, item.total),
      sinSla: calcularPorcentaje(item.sinSla, item.total),
      total: item.total,
      evaluados: item.evaluados,
      dentroCantidad: item.dentroSla,
      fueraCantidad: item.fueraSla,
      sinSlaCantidad: item.sinSla,
      proximoAVencer: item.proximoAVencer,
    }))
    .sort((a, b) => b.total - a.total);
}

function obtenerPeorCumplimiento(data: SlaComparativoItem[]) {
  return [...data]
    .filter((item) => item.total > 0)
    .sort((a, b) => b.fuera - a.fuera)[0];
}

function calcularPorcentaje(valor: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((valor / total) * 1000) / 10;
}