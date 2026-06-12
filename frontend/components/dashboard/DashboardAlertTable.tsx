import Link from "next/link";
import { AlertTriangle, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import type { DashboardTicketAlerta } from "@/types/dashboard";
import { formatearFecha } from "@/utils/dates";

interface DashboardAlertTableProps {
  titulo: string;
  descripcion: string;
  tickets: DashboardTicketAlerta[];
  tipo: "vencidos" | "proximos";
}

export default function DashboardAlertTable({
  titulo,
  descripcion,
  tickets,
  tipo,
}: DashboardAlertTableProps) {
  const esVencido = tipo === "vencidos";

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
              esVencido
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            {tickets.length}
          </span>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
          No hay tickets para mostrar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left font-semibold">Ticket</th>
                <th className="px-4 py-3 text-left font-semibold">Prioridad</th>
                <th className="px-4 py-3 text-left font-semibold">Técnico</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Límite resolución
                </th>
                <th className="px-4 py-3 text-left font-semibold">Alerta</th>
                <th className="px-5 py-3 text-right font-semibold">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        #{ticket.id}
                      </span>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {ticket.titulo}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {ticket.estado}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {ticket.prioridad}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {ticket.tecnicoAsignado ?? "Sin asignar"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {ticket.fechaLimiteResolucion
                      ? formatearFecha(ticket.fechaLimiteResolucion)
                      : "Sin fecha"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        esVencido
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {ticket.tipoAlerta}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}