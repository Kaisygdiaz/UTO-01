"use client";

import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import Card from "@/components/ui/Card";
import TicketsContent from "@/components/tickets/TicketsContent";
import TicketsFilters from "@/components/tickets/TicketsFilters";
import TicketsHeader from "@/components/tickets/TicketsHeader";
import { useTickets } from "@/hooks/useTickets";
import { FileText, PlusCircle } from "lucide-react";

export default function TicketsPage() {
  const {
    tickets,
    ticketsFiltrados,
    estadosDisponibles,
    estadoSeleccionado,
    setEstadoSeleccionado,
    busqueda,
    setBusqueda,
    cargando,
    error,
  } = useTickets();

  const noTieneTickets = !cargando && !error && tickets.length === 0;

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TicketsHeader />

          <Link
            href="/tickets/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo ticket
          </Link>
        </div>

        {noTieneTickets ? (
          <Card>
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="rounded-2xl bg-blue-50 p-4">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No tienes tickets registrados
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Cuando reportes un incidente o solicitud de soporte, aparecerá
                aquí para que puedas darle seguimiento a su estado, comentarios,
                adjuntos e historial.
              </p>

              <Link
                href="/tickets/nuevo"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4" />
                Crear primer ticket
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <TicketsFilters
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              estadosDisponibles={estadosDisponibles}
              estadoSeleccionado={estadoSeleccionado}
              setEstadoSeleccionado={setEstadoSeleccionado}
              totalFiltrados={ticketsFiltrados.length}
              totalTickets={tickets.length}
            />

            <TicketsContent
              tickets={ticketsFiltrados}
              cargando={cargando}
              error={error}
            />
          </Card>
        )}
      </section>
    </AppLayout>
  );
}