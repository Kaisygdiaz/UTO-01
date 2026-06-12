"use client";

import Card from "@/components/ui/Card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DashboardDonutItem {
  label: string;
  total: number;
}

interface DashboardDonutChartProps {
  titulo: string;
  descripcion: string;
  items: DashboardDonutItem[];
  centroLabel: string;
}

const colores = [
  "#2563eb",
  "#dc2626",
  "#f59e0b",
  "#7c3aed",
  "#059669",
  "#64748b",
];

export default function DashboardDonutChart({
  titulo,
  descripcion,
  items,
  centroLabel,
}: DashboardDonutChartProps) {
  const total = items.reduce((acumulado, item) => acumulado + item.total, 0);

  const data = items.map((item) => ({
    name: item.label,
    value: item.total,
  }));

  return (
    <Card className="p-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>

      {total === 0 ? (
        <div className="mt-8 flex min-h-[300px] items-center justify-center text-sm text-slate-500">
          No hay datos para mostrar.
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={colores[index % colores.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-slate-900">{total}</p>
              <p className="text-xs font-medium text-slate-500">
                {centroLabel}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const porcentaje = total > 0 ? (item.total / total) * 100 : 0;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: colores[index % colores.length],
                      }}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.label}
                      </p>

                      <p className="text-xs text-slate-500">
                        {porcentaje.toFixed(1)}% del total
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-slate-900">
                    {item.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}