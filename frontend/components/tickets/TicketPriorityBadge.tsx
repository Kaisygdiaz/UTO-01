import { obtenerEstiloPrioridad } from "@/utils/ticketStyles";

interface TicketPriorityBadgeProps {
  prioridad: string;
}

export default function TicketPriorityBadge({
  prioridad,
}: TicketPriorityBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerEstiloPrioridad(
        prioridad
      )}`}
    >
      {prioridad}
    </span>
  );
}