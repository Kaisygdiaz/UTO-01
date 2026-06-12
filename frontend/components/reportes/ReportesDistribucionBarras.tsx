"use client";

import Card from "../ui/Card";
import type { ReporteDistribucionItem } from "../../types/reportes";
import { formatearPorcentaje } from "../../utils/reportesHelpers";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReportesDistribucionBarrasProps {
  titulo: string;
  descripcion: string;
  items: ReporteDistribucionItem[];
  tipo: "categoria" | "tecnico";
}

export default function ReportesDistribucionBarras({
  titulo,
  descripcion,
  items,
  tipo,
}: ReportesDistribucionBarrasProps) {
  const data = items.map((item) => ({
    nombre: item.label,
    porcentaje: item.porcentaje,
    total: item.total,
  }));

  const mayor = data[0];

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
          {mayor && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Mayor concentración
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {mayor.nombre}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Representa el{" "}
                <strong>{formatearPorcentaje(mayor.porcentaje)}%</strong> de
                los tickets filtrados ({mayor.total} tickets).
              </p>
            </div>
          )}

          <div className="h-[320px]">
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

                <Tooltip
                  formatter={(value, name, props) => [
                    `${formatearPorcentaje(Number(value))}% · ${
                      props.payload.total
                    } tickets`,
                    tipo === "categoria" ? "Categoría" : "Técnico",
                  ]}
                />

                <Bar
                  dataKey="porcentaje"
                  fill={tipo === "categoria" ? "#2563eb" : "#059669"}
                  radius={[0, 8, 8, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 space-y-3">
            {data.map((item) => (
              <div
                key={item.nombre}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {item.nombre}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.total} tickets incluidos
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
                  {formatearPorcentaje(item.porcentaje)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function EstadoVacio() {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-5 py-8 text-sm text-slate-500">
      No hay datos para mostrar.
    </div>
  );
}