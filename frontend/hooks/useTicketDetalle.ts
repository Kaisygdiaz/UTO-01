"use client";

import { useEffect, useState } from "react";
import {
  obtenerAdjuntosTicket,
  obtenerBitacoraTicket,
  obtenerComentariosTicket,
  obtenerTicketPorId,
} from "@/lib/tickets";
import type {
  AdjuntoTicket,
  BitacoraTicket,
  ComentarioTicket,
  TicketDetalle,
} from "@/types/tickets";

export function useTicketDetalle(id: number) {
  const [ticket, setTicket] = useState<TicketDetalle | null>(null);
  const [bitacora, setBitacora] = useState<BitacoraTicket[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioTicket[]>([]);
  const [adjuntos, setAdjuntos] = useState<AdjuntoTicket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDetalle() {
      if (!id || Number.isNaN(id)) {
        setError("El identificador del ticket no es válido.");
        setCargando(false);
        return;
      }

      try {
        setError("");
        setCargando(true);

        const [ticketData, bitacoraData, comentariosData, adjuntosData] =
          await Promise.all([
            obtenerTicketPorId(id),
            obtenerBitacoraTicket(id),
            obtenerComentariosTicket(id),
            obtenerAdjuntosTicket(id),
          ]);

        setTicket(ticketData);
        setBitacora(bitacoraData);
        setComentarios(comentariosData);
        setAdjuntos(adjuntosData);
      } catch {
        setError("No fue posible cargar el detalle del ticket.");
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [id]);

  return {
    ticket,
    bitacora,
    comentarios,
    adjuntos,
    cargando,
    error,
  };
}