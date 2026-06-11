import { Search } from "lucide-react";

interface TicketsSearchBarProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;
  totalFiltrados: number;
  totalTickets: number;
}

export default function TicketsSearchBar({
  busqueda,
  setBusqueda,
  totalFiltrados,
  totalTickets,
}: TicketsSearchBarProps) {
  return (
    <div className="p-5 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título, estado, prioridad, categoría..."
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <p className="text-sm text-slate-500">
        Mostrando {totalFiltrados} de {totalTickets} tickets
      </p>
    </div>
  );
}