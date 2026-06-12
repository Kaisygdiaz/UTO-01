import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Folder,
  ShieldCheck,
  UserCheck,
  UserRound,
} from "lucide-react";
import type { TicketListado } from "@/types/tickets";
import { formatearFecha } from "@/utils/dates";
import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketStatusBadge from "./TicketStatusBadge";

interface TicketsTableProps {
  tickets: TicketListado[];
}

export default function TicketsTable({ tickets }: TicketsTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1120px] table-fixed text-sm">
        <colgroup>
          <col className="w-[240px]" />
          <col className="w-[115px]" />
          <col className="w-[115px]" />
          <col className="w-[145px]" />
          <col className="w-[155px]" />
          <col className="w-[210px]" />
          <col className="w-[130px]" />
          <col className="w-[110px]" />
        </colgroup>

        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-4 text-left font-semibold">Ticket</th>
            <th className="px-3 py-4 text-left font-semibold">Estado</th>
            <th className="px-3 py-4 text-left font-semibold">Prioridad</th>
            <th className="px-3 py-4 text-left font-semibold">SLA</th>
            <th className="px-3 py-4 text-left font-semibold">Categoría</th>
            <th className="px-3 py-4 text-left font-semibold">Responsable</th>
            <th className="px-3 py-4 text-left font-semibold">Creación</th>
            <th className="px-4 py-4 text-right font-semibold">Detalle</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="transition hover:bg-slate-50">
              <td className="px-4 py-4 align-top">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    #{ticket.id}
                  </span>

                  <p className="break-words font-semibold leading-5 text-slate-900">
                    {ticket.titulo}
                  </p>
                </div>
              </td>

              <td className="px-3 py-4 align-top">
                <TicketStatusBadge estado={ticket.estado} />
              </td>

              <td className="px-3 py-4 align-top">
                <TicketPriorityBadge prioridad={ticket.prioridad} />
              </td>

              <td className="px-3 py-4 align-top">
                <SlaStatus ticket={ticket} />
              </td>

              <td className="px-3 py-4 align-top">
                <div className="flex items-start gap-2 text-slate-700">
                  <Folder className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="break-words font-medium">
                    {mostrarValor(ticket.categoria)}
                  </span>
                </div>
              </td>

              <td className="px-3 py-4 align-top">
                <div className="space-y-2">
                  <UserInfo
                    icono={<UserRound className="h-4 w-4 text-slate-500" />}
                    nombre={ticket.solicitante}
                  />

                  <UserInfo
                    icono={<UserCheck className="h-4 w-4 text-slate-500" />}
                    nombre={ticket.tecnicoAsignado}
                    sinAsignarTexto="Sin asignar"
                  />
                </div>
              </td>

              <td className="px-3 py-4 align-top">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-xs">
                    {formatearFecha(ticket.fechaCreacion)}
                  </span>
                </div>
              </td>

              <td className="px-4 py-4 text-right align-top">
                <Link
                  href={`/tickets/${ticket.id}`}
                  title="Ver detalle"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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

interface UserInfoProps {
  icono: ReactNode;
  nombre: string;
  sinAsignarTexto?: string;
}

function UserInfo({
  icono,
  nombre,
  sinAsignarTexto = "No definido",
}: UserInfoProps) {
  const tieneNombre = tieneValor(nombre);

  return (
    <div className="flex items-start gap-2">
      <div className="shrink-0 rounded-full bg-slate-100 p-1.5">{icono}</div>

      <span
        className={`break-words text-xs font-medium leading-5 ${
          tieneNombre ? "text-slate-700" : "text-amber-600"
        }`}
      >
        {tieneNombre ? nombre : sinAsignarTexto}
      </span>
    </div>
  );
}

function SlaStatus({ ticket }: { ticket: TicketListado }) {
  const sla = obtenerEstadoSla(ticket);

  return (
    <div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${sla.className}`}
      >
        {sla.icono}
        {sla.texto}
      </span>

      <p className="mt-1 text-xs text-slate-500">
        {ticket.fechaLimiteSla
          ? formatearFecha(ticket.fechaLimiteSla)
          : "Sin fecha"}
      </p>
    </div>
  );
}

function obtenerEstadoSla(ticket: TicketListado) {
  if (!ticket.fechaLimiteSla) {
    return {
      texto: "No definido",
      className: "bg-slate-100 text-slate-600",
      icono: <ShieldCheck className="h-3.5 w-3.5" />,
    };
  }

  if (ticket.estaFueraSla) {
    return {
      texto: "Vencido",
      className: "bg-red-50 text-red-700",
      icono: <AlertTriangle className="h-3.5 w-3.5" />,
    };
  }

  if (ticket.estaProximoAVencerSla) {
    return {
      texto: "En riesgo",
      className: "bg-amber-50 text-amber-700",
      icono: <Clock className="h-3.5 w-3.5" />,
    };
  }

  return {
    texto: "En tiempo",
    className: "bg-emerald-50 text-emerald-700",
    icono: <CheckCircle2 className="h-3.5 w-3.5" />,
  };
}

function tieneValor(valor: string) {
  return valor.trim() !== "" && valor !== "No definido";
}

function mostrarValor(valor: string) {
  return tieneValor(valor) ? valor : "No definido";
}