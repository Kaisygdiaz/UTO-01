"use client";

import AppLayout from "@/components/AppLayout";
import Card from "@/components/ui/Card";
import TicketsContent from "@/components/tickets/TicketsContent";
import TicketsFilters from "@/components/tickets/TicketsFilters";
import TicketsHeader from "@/components/tickets/TicketsHeader";
import { useTickets } from "@/hooks/useTickets";

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

  return (
    <AppLayout>
      <section className="space-y-6">
        <TicketsHeader />

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
      </section>
    </AppLayout>
  );
}