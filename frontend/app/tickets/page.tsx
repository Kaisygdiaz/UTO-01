"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { obtenerTickets } from "@/lib/tickets";
import type { TicketListado } from "@/types/tickets";
import {
  Loader2,
  Search,
  AlertTriangle,
  BellRing,
  Eye,
} from "lucide-react";

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha";

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return fechaConvertida.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function obtenerEstiloEstado(estado: string) {
  const estadoNormalizado = estado.toLowerCase();

  if (estadoNormalizado.includes("abierto")) {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  if (estadoNormalizado.includes("proceso")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (estadoNormalizado.includes("resuelto")) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (estadoNormalizado.includes("cerrado")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (estadoNormalizado.includes("cancelado")) {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function obtenerEstiloPrioridad(prioridad: string) {
  const prioridadNormalizada = prioridad.toLowerCase();

  if (prioridadNormalizada.includes("crítica") || prioridadNormalizada.includes("critica")) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (prioridadNormalizada.includes("alta")) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (prioridadNormalizada.includes("media")) {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (prioridadNormalizada.includes("baja")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketListado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarTickets() {
      try {
        setError("");
        setCargando(true);

        const data = await obtenerTickets();

        setTickets(data);
      } catch {
        setError("No fue posible cargar el listado de tickets.");
      } finally {
        setCargando(false);
      }
    }

    cargarTickets();
  }, []);

  const ticketsFiltrados = tickets.filter((ticket) => {
    const textoBusqueda = busqueda.toLowerCase();

    return (
      ticket.titulo.toLowerCase().includes(textoBusqueda) ||
      ticket.descripcion.toLowerCase().includes(textoBusqueda) ||
      ticket.estado.toLowerCase().includes(textoBusqueda) ||
      ticket.prioridad.toLowerCase().includes(textoBusqueda) ||
      ticket.categoria.toLowerCase().includes(textoBusqueda) ||
      ticket.solicitante.toLowerCase().includes(textoBusqueda)
    );
  });

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
            <p className="text-slate-500 mt-1">
              Listado general de incidentes tecnológicos registrados en el sistema.
            </p>
          </div>

          <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Nuevo ticket
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
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
              Mostrando {ticketsFiltrados.length} de {tickets.length} tickets
            </p>
          </div>

          {cargando && (
            <div className="p-8 flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Cargando tickets...
            </div>
          )}

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {!cargando && !error && ticketsFiltrados.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron tickets para mostrar.
            </div>
          )}

          {!cargando && !error && ticketsFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold">ID</th>
                    <th className="px-5 py-4 text-left font-semibold">Título</th>
                    <th className="px-5 py-4 text-left font-semibold">Estado</th>
                    <th className="px-5 py-4 text-left font-semibold">Prioridad</th>
                    <th className="px-5 py-4 text-left font-semibold">Categoría</th>
                    <th className="px-5 py-4 text-left font-semibold">Solicitante</th>
                    <th className="px-5 py-4 text-left font-semibold">Técnico</th>
                    <th className="px-5 py-4 text-left font-semibold">Creación</th>
                    <th className="px-5 py-4 text-left font-semibold">SLA</th>
                    <th className="px-5 py-4 text-right font-semibold">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {ticketsFiltrados.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        #{ticket.id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {ticket.titulo}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {ticket.descripcion}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                            ticket.estado
                          )}`}
                        >
                          {ticket.estado}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerEstiloPrioridad(
                            ticket.prioridad
                          )}`}
                        >
                          {ticket.prioridad}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {ticket.categoria}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {ticket.solicitante}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {ticket.tecnicoAsignado}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {formatearFecha(ticket.fechaCreacion)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {ticket.estaFueraSla && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Vencido
                            </span>
                          )}

                          {!ticket.estaFueraSla && ticket.estaProximoAVencerSla && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                              <BellRing className="h-3.5 w-3.5" />
                              Por vencer
                            </span>
                          )}

                          {!ticket.estaFueraSla && !ticket.estaProximoAVencerSla && (
                            <span className="text-xs text-slate-500">
                              {formatearFecha(ticket.fechaLimiteSla)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}