import Card from "@/components/ui/Card";
import { formatearFecha } from "@/utils/dates";
import type { TicketDetalle } from "@/types/tickets";
import { CalendarClock } from "lucide-react";

interface TicketTimelineInfoProps {
  ticket: TicketDetalle;
}

export default function TicketTimelineInfo({ ticket }: TicketTimelineInfoProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">
          Fechas del ticket
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        <TimelineItem
          titulo="Fecha de creación"
          fecha={ticket.fechaCreacion}
          activo
        />

        <TimelineItem
          titulo="Primera respuesta"
          fecha={ticket.fechaPrimeraRespuesta}
        />

        <TimelineItem
          titulo="Fecha de resolución"
          fecha={ticket.fechaResolucion}
        />

        <TimelineItem titulo="Fecha de cierre" fecha={ticket.fechaCierre} />

        {ticket.fechaEscalamiento && (
          <TimelineItem
            titulo="Fecha de escalamiento"
            fecha={ticket.fechaEscalamiento}
          />
        )}

        {ticket.fechaCancelacion && (
          <TimelineItem
            titulo="Fecha de cancelación"
            fecha={ticket.fechaCancelacion}
          />
        )}

        {ticket.fechaReapertura && (
          <TimelineItem
            titulo="Fecha de reapertura"
            fecha={ticket.fechaReapertura}
          />
        )}
      </div>
    </Card>
  );
}

interface TimelineItemProps {
  titulo: string;
  fecha: string | null;
  activo?: boolean;
}

function TimelineItem({ titulo, fecha, activo = false }: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ${
            activo ? "bg-blue-600" : "bg-slate-300"
          }`}
        />
        <div className="mt-1 h-full w-px bg-slate-200" />
      </div>

      <div className="pb-4">
        <p className="font-semibold text-slate-900">{titulo}</p>
        <p className="text-sm text-slate-500">{formatearFecha(fecha)}</p>
      </div>
    </div>
  );
}