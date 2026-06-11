import { obtenerEstiloEstado } from "@/utils/ticketStyles";

interface TicketStatusBadgeProps {
  estado: string;
}

export default function TicketStatusBadge({ estado }: TicketStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
        estado
      )}`}
    >
      {estado}
    </span>
  );
}