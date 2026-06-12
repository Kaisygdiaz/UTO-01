import Link from "next/link";
import { Eye, UserRound } from "lucide-react";
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
      <table className="w-full min-w-[1050px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-4 text-left font-semibold">Ticket</th>
            <th className="px-5 py-4 text-left font-semibold">Estado</th>
            <th className="px-5 py-4 text-left font-semibold">Prioridad</th>
            <th className="px-5 py-4 text-left font-semibold">Categoría</th>
            <th className="px-5 py-4 text-left font-semibold">Solicitante</th>
            <th className="px-5 py-4 text-left font-semibold">Técnico</th>
            <th className="px-5 py-4 text-left font-semibold">Creación</th>
            <th className="px-5 py-4 text-right font-semibold">Acción</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    #{ticket.id}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {ticket.titulo}
                    </p>
                    <p className="mt-1 max-w-md text-xs text-slate-500 line-clamp-1">
                      {ticket.descripcion}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <TicketStatusBadge estado={ticket.estado} />
              </td>

              <td className="px-5 py-4">
                <TicketPriorityBadge prioridad={ticket.prioridad} />
              </td>

              <td className="px-5 py-4 text-slate-700">
                {ticket.categoria}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="rounded-full bg-slate-100 p-1.5">
                    <UserRound className="h-4 w-4 text-slate-500" />
                  </div>

                  <span>{ticket.solicitante}</span>
                </div>
              </td>

              <td className="px-5 py-4 text-slate-700">
                {ticket.tecnicoAsignado}
              </td>

              <td className="px-5 py-4 text-slate-600">
                {formatearFecha(ticket.fechaCreacion)}
              </td>

              <td className="px-5 py-4 text-right">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}