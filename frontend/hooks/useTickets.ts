"use client";

import { useEffect, useMemo, useState } from "react";
import { obtenerTickets } from "@/lib/tickets";
import type { TicketListado } from "@/types/tickets";

export function useTickets() {
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

  const ticketsFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return tickets.filter((ticket) => {
      return (
        ticket.titulo.toLowerCase().includes(texto) ||
        ticket.descripcion.toLowerCase().includes(texto) ||
        ticket.estado.toLowerCase().includes(texto) ||
        ticket.prioridad.toLowerCase().includes(texto) ||
        ticket.categoria.toLowerCase().includes(texto) ||
        ticket.solicitante.toLowerCase().includes(texto) ||
        ticket.tecnicoAsignado.toLowerCase().includes(texto)
      );
    });
  }, [tickets, busqueda]);

  return {
    tickets,
    ticketsFiltrados,
    busqueda,
    setBusqueda,
    cargando,
    error,
  };
}