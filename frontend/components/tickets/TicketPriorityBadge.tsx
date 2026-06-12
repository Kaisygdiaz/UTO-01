import { obtenerEstiloPrioridad } from "@/utils/ticketStyles";

interface TicketPriorityBadgeProps {
  prioridad: string;
}

export default function TicketPriorityBadge({
  prioridad,
}: TicketPriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold leading-none ${obtenerEstiloPrioridad(
        prioridad
      )}`}
    >
      {prioridad}
    </span>
  );
}