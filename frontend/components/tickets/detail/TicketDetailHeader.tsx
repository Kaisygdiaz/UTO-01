import Card from "@/components/ui/Card";
import TicketPriorityBadge from "@/components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "@/components/tickets/TicketStatusBadge";
import type { TicketDetalle } from "@/types/tickets";

interface TicketDetailHeaderProps {
  ticket: TicketDetalle;
}

export default function TicketDetailHeader({ ticket }: TicketDetailHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Ticket #{ticket.id}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {ticket.titulo}
          </h1>

          <p className="mt-3 max-w-4xl text-slate-600">
            {ticket.descripcion}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <TicketStatusBadge estado={ticket.estado} />
          <TicketPriorityBadge prioridad={ticket.prioridad} />
        </div>
      </div>
    </Card>
  );
}