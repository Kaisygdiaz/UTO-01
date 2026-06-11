import { api } from "./api";
import type { DashboardData } from "@/types/dashboard";

function obtenerNumero(objeto: Record<string, unknown>, ...claves: string[]): number {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "number") {
      return valor;
    }
  }

  return 0;
}

export async function obtenerDashboard(): Promise<DashboardData> {
  const response = await api.get<Record<string, unknown>>("/Tickets/dashboard");
  const data = response.data;

  return {
    totalTickets: obtenerNumero(data, "totalTickets", "total", "TotalTickets", "Total"),
    abiertos: obtenerNumero(data, "abiertos", "ticketsAbiertos", "Abiertos", "TicketsAbiertos"),
    enProceso: obtenerNumero(data, "enProceso", "ticketsEnProceso", "EnProceso", "TicketsEnProceso"),
    resueltos: obtenerNumero(data, "resueltos", "ticketsResueltos", "Resueltos", "TicketsResueltos"),
    cerrados: obtenerNumero(data, "cerrados", "ticketsCerrados", "Cerrados", "TicketsCerrados"),
    cancelados: obtenerNumero(data, "cancelados", "ticketsCancelados", "Cancelados", "TicketsCancelados"),
    fueraSla: obtenerNumero(data, "fueraSla", "fueraDeSla", "ticketsFueraSla", "FueraSla", "FueraDeSla"),
    proximosVencerSla: obtenerNumero(
      data,
      "proximosVencerSla",
      "proximosAVencerSla",
      "ticketsProximosVencerSla",
      "ProximosVencerSla",
      "ProximosAVencerSla"
    ),
  };
}