import Link from "next/link";
import { AlertTriangle, BellRing, Eye } from "lucide-react";
import type { TicketListado } from "@/types/tickets";
import { formatearFecha } from "@/utils/dates";
import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketStatusBadge from "./TicketStatusBadge";

interface TicketsTableProps {
  tickets: TicketListado[];
}

export default function TicketsTable({ tickets }: TicketsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-5 py-4 text-left font-semibold">ID</th>
            <th className="px-5 py-4 text-left font-semibold">Título</th>
            <th className="px-5 py-4 text-left font-semibold">Estado</th>
            <th className="px-5 py-4 text-left font-semibold">Prioridad</th>
            <th className="px-5 py-4 text-left font-semibold">Categoría</th>
            <th className="px-5 py-4 text-left font-semibold">Solicitante</th>
            <th className="px-5 py-4 text-left font-semibold">Técnico</th>
            <th className="px-5 py-4 text-left font-semibold">Creación</th>
            <th className="px-5 py-4 text-left font-semibold">SLA</th>
            <th className="px-5 py-4 text-right font-semibold">Acción</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-900">
                #{ticket.id}
              </td>

              <td className="px-5 py-4">
                <p className="font-semibold text-slate-900">{ticket.titulo}</p>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {ticket.descripcion}
                </p>
              </td>

              <td className="px-5 py-4">
                <TicketStatusBadge estado={ticket.estado} />
              </td>

              <td className="px-5 py-4">
                <TicketPriorityBadge prioridad={ticket.prioridad} />
              </td>

              <td className="px-5 py-4 text-slate-700">{ticket.categoria}</td>

              <td className="px-5 py-4 text-slate-700">{ticket.solicitante}</td>

              <td className="px-5 py-4 text-slate-700">
                {ticket.tecnicoAsignado}
              </td>

              <td className="px-5 py-4 text-slate-700">
                {formatearFecha(ticket.fechaCreacion)}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {ticket.estaFueraSla && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Vencido
                    </span>
                  )}

                  {!ticket.estaFueraSla && ticket.estaProximoAVencerSla && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                      <BellRing className="h-3.5 w-3.5" />
                      Por vencer
                    </span>
                  )}

                  {!ticket.estaFueraSla &&
                    !ticket.estaProximoAVencerSla && (
                      <span className="text-xs text-slate-500">
                        {formatearFecha(ticket.fechaLimiteSla)}
                      </span>
                    )}
                </div>
              </td>

              <td className="px-5 py-4 text-right">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
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
  );
}