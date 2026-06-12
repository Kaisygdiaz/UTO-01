import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import type { TicketListado } from "@/types/tickets";
import { SearchX } from "lucide-react";
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
    return (
      <div className="px-5 py-10">
        <LoadingState mensaje="Cargando tickets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-5">
        <ErrorMessage mensaje={error} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return <TicketsEmptyState />;
  }

  return <TicketsTable tickets={tickets} />;
}

function TicketsEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
        <SearchX className="h-9 w-9" />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        No se encontraron tickets
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        No hay resultados que coincidan con la búsqueda o el filtro seleccionado.
        Ajuste los filtros para visualizar otros tickets registrados.
      </p>
    </div>
  );
}