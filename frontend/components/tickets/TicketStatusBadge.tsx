import { obtenerEstiloEstado } from "@/utils/ticketStyles";

interface TicketStatusBadgeProps {
  estado: string;
}

export default function TicketStatusBadge({ estado }: TicketStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold leading-none ${obtenerEstiloEstado(
        estado
      )}`}
    >
      {estado}
    </span>
  );
}