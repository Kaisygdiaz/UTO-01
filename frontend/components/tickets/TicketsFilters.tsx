import { Search, SlidersHorizontal, X } from "lucide-react";

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
  const estadoInicial = estadosDisponibles[0] ?? "";
  const tieneFiltrosActivos =
    busqueda.trim() !== "" || estadoSeleccionado !== estadoInicial;

  function limpiarFiltros() {
    setBusqueda("");
    setEstadoSeleccionado(estadoInicial);
  }

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, prioridad, categoría o responsable..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 lg:w-auto">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />

            <select
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none lg:min-w-44"
            >
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {tieneFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {totalFiltrados} resultado{totalFiltrados === 1 ? "" : "s"}
          </span>

          <span className="text-sm text-slate-500">
            de <span className="font-semibold text-slate-900">{totalTickets}</span>{" "}
            tickets
          </span>
        </div>
      </div>
    </div>
  );
}