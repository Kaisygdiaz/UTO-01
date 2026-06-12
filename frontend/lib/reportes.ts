import { obtenerTickets } from "@/lib/tickets";
import type { TicketListado } from "@/types/tickets";

export async function obtenerTicketsParaReportes(): Promise<TicketListado[]> {
  return obtenerTickets();
}