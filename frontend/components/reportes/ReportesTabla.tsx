import Link from "next/link";
import Card from "../ui/Card";
import type { TicketListado } from "../../types/tickets";
import { formatearFecha } from "../../utils/dates";
import { obtenerTecnico } from "../../utils/reportesHelpers";
import { Eye, FileText } from "lucide-react";

interface ReportesTablaProps {
  tickets: TicketListado[];
}

export default function ReportesTabla({ tickets }: ReportesTablaProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Detalle del reporte
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tickets considerados en los cálculos estadísticos actuales.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <FileText className="h-4 w-4" />
            {tickets.length}
          </span>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          No hay tickets que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <Th>Ticket</Th>
                <Th>Estado</Th>
                <Th>Prioridad</Th>
                <Th>Categoría</Th>
                <Th>Técnico</Th>
                <Th>Creación</Th>
                <Th>SLA</Th>
                <Th align="right" className="print-hidden">
                  Detalle
                </Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="transition hover:bg-slate-50">
                  <Td>
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        #{ticket.id}
                      </span>

                      <div>
                        <p className="font-bold text-slate-900">
                          {ticket.titulo}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {ticket.descripcion}
                        </p>
                      </div>
                    </div>
                  </Td>

                  <Td>
                    <span className="font-semibold text-slate-700">
                      {ticket.estado}
                    </span>
                  </Td>

                  <Td>{ticket.prioridad}</Td>
                  <Td>{ticket.categoria}</Td>
                  <Td>{obtenerTecnico(ticket)}</Td>
                  <Td>{formatearFecha(ticket.fechaCreacion)}</Td>

                  <Td>
                    <SlaBadge ticket={ticket} />
                  </Td>

                  <Td align="right" className="print-hidden">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SlaBadge({ ticket }: { ticket: TicketListado }) {
  if (!ticket.fechaLimiteSla) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        Sin SLA
      </span>
    );
  }

  if (ticket.estaFueraSla) {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
        Fuera de SLA
      </span>
    );
  }

  if (ticket.estaProximoAVencerSla) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        Próximo
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      Dentro de SLA
    </span>
  );
}

function Th({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-3 font-bold ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`px-5 py-4 align-top text-slate-600 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}