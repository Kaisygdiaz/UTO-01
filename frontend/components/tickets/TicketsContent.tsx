import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import type { TicketListado } from "@/types/tickets";
import TicketsTable from "./TicketsTable";

interface TicketsContentProps {
  tickets: TicketListado[];
  cargando: boolean;
  error: string;
}

export default function TicketsContent({
  tickets,
  cargando,
  error,
}: TicketsContentProps) {
  if (cargando) {
    return <LoadingState mensaje="Cargando tickets..." />;
  }

  if (error) {
    return (
      <div className="m-5">
        <ErrorMessage mensaje={error} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontraron tickets para mostrar.
      </div>
    );
  }

  return <TicketsTable tickets={tickets} />;
}