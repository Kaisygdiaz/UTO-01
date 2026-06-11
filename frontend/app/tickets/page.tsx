"use client";

import AppLayout from "@/components/AppLayout";
import Card from "@/components/ui/Card";
import TicketsContent from "@/components/tickets/TicketsContent";
import TicketsHeader from "@/components/tickets/TicketsHeader";
import TicketsSearchBar from "@/components/tickets/TicketsSearchBar";
import { useTickets } from "@/hooks/useTickets";

export default function TicketsPage() {
  const {
    tickets,
    ticketsFiltrados,
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
          <TicketsSearchBar
            busqueda={busqueda}
            setBusqueda={setBusqueda}
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