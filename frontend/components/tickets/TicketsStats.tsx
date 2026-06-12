import {
  AlertTriangle,
  CircleDot,
  ClipboardList,
  Clock,
} from "lucide-react";

interface TicketsStatsProps {
  total: number;
  abiertos: number;
  enProceso: number;
  fueraSla: number;
}

export default function TicketsStats({
  total,
  abiertos,
  enProceso,
  fueraSla,
}: TicketsStatsProps) {
  const items = [
    {
      titulo: "Total tickets",
      valor: total,
      descripcion: "Solicitudes registradas",
      icono: ClipboardList,
      color: "text-blue-600",
    },
    {
      titulo: "Abiertos",
      valor: abiertos,
      descripcion: "Pendientes de atención",
      icono: CircleDot,
      color: "text-sky-600",
    },
    {
      titulo: "En proceso",
      valor: enProceso,
      descripcion: "Actualmente asignados",
      icono: Clock,
      color: "text-amber-600",
    },
    {
      titulo: "Fuera de SLA",
      valor: fueraSla,
      descripcion: "Requieren prioridad",
      icono: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icono = item.icono;

        return (
          <div
            key={item.titulo}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{item.titulo}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {item.valor}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {item.descripcion}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <Icono className={`h-5 w-5 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}