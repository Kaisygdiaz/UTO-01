import { Search, SlidersHorizontal } from "lucide-react";

interface TicketsFiltersProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;
  estadosDisponibles: string[];
  estadoSeleccionado: string;
  setEstadoSeleccionado: (valor: string) => void;
  totalFiltrados: number;
  totalTickets: number;
}

export default function TicketsFilters({
  busqueda,
  setBusqueda,
  estadosDisponibles,
  estadoSeleccionado,
  setEstadoSeleccionado,
  totalFiltrados,
  totalTickets,
}: TicketsFiltersProps) {
  return (
    <div className="border-b border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar ticket, estado, prioridad, categoría..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />

            <select
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Mostrando{" "}
          <span className="font-semibold text-slate-900">
            {totalFiltrados}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-slate-900">{totalTickets}</span>{" "}
          tickets
        </p>
      </div>
    </div>
  );
}