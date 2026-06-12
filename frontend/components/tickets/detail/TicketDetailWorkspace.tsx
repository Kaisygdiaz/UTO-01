"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import TicketPriorityBadge from "@/components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "@/components/tickets/TicketStatusBadge";
import { formatearFecha } from "@/utils/dates";
import {
  obtenerEstiloEstado,
  obtenerEstiloImpacto,
  obtenerEstiloPrioridad,
  obtenerEstiloUrgencia,
} from "@/utils/ticketStyles";
import type {
  AdjuntoTicket,
  BitacoraTicket,
  ComentarioTicket,
  TicketDetalle,
} from "@/types/tickets";
import { api } from "@/lib/api";
import { obtenerUrlDescargaAdjunto } from "@/lib/tickets";
import {
  Clock,
  Download,
  FileText,
  History,
  MessageSquare,
  Paperclip,
} from "lucide-react";

interface TicketDetailWorkspaceProps {
  ticket: TicketDetalle;
  comentarios: ComentarioTicket[];
  adjuntos: AdjuntoTicket[];
  historial: BitacoraTicket[];
}

type TabActiva = "conversaciones" | "detalles" | "adjuntos" | "historial";

export default function TicketDetailWorkspace({
  ticket,
  comentarios,
  adjuntos,
  historial,
}: TicketDetailWorkspaceProps) {
  const [tabActiva, setTabActiva] = useState<TabActiva>("conversaciones");

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Ticket #{ticket.id}
              </span>

              <TicketStatusBadge estado={ticket.estado} />
              <TicketPriorityBadge prioridad={ticket.prioridad} />
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {ticket.titulo}
            </h1>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              {ticket.descripcion}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Solicitante: {ticket.solicitante}</span>
              <span>Técnico: {ticket.tecnicoAsignado}</span>
              <span>Creado: {formatearFecha(ticket.fechaCreacion)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Asignar
            </button>

            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Cambiar estado
            </button>

            <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Responder
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-6">
        <nav className="flex gap-6 overflow-x-auto">
          <TabButton
            activa={tabActiva === "conversaciones"}
            onClick={() => setTabActiva("conversaciones")}
          >
            Conversaciones
          </TabButton>

          <TabButton
            activa={tabActiva === "detalles"}
            onClick={() => setTabActiva("detalles")}
          >
            Detalles
          </TabButton>

          <TabButton
            activa={tabActiva === "adjuntos"}
            onClick={() => setTabActiva("adjuntos")}
          >
            Adjuntos
          </TabButton>

          <TabButton
            activa={tabActiva === "historial"}
            onClick={() => setTabActiva("historial")}
          >
            Historial
          </TabButton>
        </nav>
      </div>

      <div className="min-h-[420px] bg-white p-6">
        {tabActiva === "conversaciones" && (
          <ConversacionesPanel comentarios={comentarios} />
        )}

        {tabActiva === "detalles" && <DetallesPanel ticket={ticket} />}

        {tabActiva === "adjuntos" && (
          <AdjuntosPanel ticketId={ticket.id} adjuntos={adjuntos} />
        )}

        {tabActiva === "historial" && <HistorialPanel historial={historial} />}
      </div>
    </Card>
  );
}

interface TabButtonProps {
  children: React.ReactNode;
  activa: boolean;
  onClick: () => void;
}

function TabButton({ children, activa, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-1 py-4 text-sm font-semibold transition ${
        activa
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function ConversacionesPanel({
  comentarios,
}: {
  comentarios: ComentarioTicket[];
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Conversaciones</h2>
      </div>

      {comentarios.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            Este ticket todavía no tiene conversaciones registradas.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comentarios.map((comentario) => (
          <div
            key={comentario.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {comentario.usuario}
                </p>
                <p className="text-xs text-slate-500">{comentario.rol}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {comentario.tipoComentario}
                </span>

                {comentario.esInterno && (
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Interno
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {comentario.comentario}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              {formatearFecha(comentario.fechaRegistro)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetallesPanel({ ticket }: { ticket: TicketDetalle }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Detalles del ticket</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <DetailItem label="Categoría" value={ticket.categoria} />
        <ColoredDetailItem
          label="Estado"
          value={ticket.estado}
          className={obtenerEstiloEstado(ticket.estado)}
        />
        <ColoredDetailItem
          label="Prioridad"
          value={ticket.prioridad}
          className={obtenerEstiloPrioridad(ticket.prioridad)}
        />
        <ColoredDetailItem
          label="Impacto"
          value={ticket.impacto}
          className={obtenerEstiloImpacto(ticket.impacto)}
        />
        <ColoredDetailItem
          label="Urgencia"
          value={ticket.urgencia}
          className={obtenerEstiloUrgencia(ticket.urgencia)}
        />
        <DetailItem label="Solicitante" value={ticket.solicitante} />
        <DetailItem label="Técnico asignado" value={ticket.tecnicoAsignado} />
        <DetailItem
          label="Fecha de creación"
          value={formatearFecha(ticket.fechaCreacion)}
        />
        <DetailItem
          label="Primera respuesta"
          value={formatearFecha(ticket.fechaPrimeraRespuesta)}
        />
        <DetailItem
          label="Resolución"
          value={formatearFecha(ticket.fechaResolucion)}
        />
        <DetailItem label="Cierre" value={formatearFecha(ticket.fechaCierre)} />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Solución</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {ticket.solucion || "Aún no se ha registrado una solución."}
        </p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ColoredDetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function AdjuntosPanel({
  ticketId,
  adjuntos,
}: {
  ticketId: number;
  adjuntos: AdjuntoTicket[];
}) {
  async function descargarAdjunto(adjuntoId: number, nombreArchivo: string) {
    const response = await api.get(
      obtenerUrlDescargaAdjunto(ticketId, adjuntoId),
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Adjuntos</h2>
      </div>

      {adjuntos.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            Este ticket no tiene archivos adjuntos.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {adjuntos.map((adjunto) => (
          <div
            key={adjunto.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-3">
              <div className="rounded-xl bg-slate-100 p-2">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {adjunto.nombreArchivoOriginal}
                </p>
                <p className="text-xs text-slate-500">
                  {adjunto.usuario} · {formatearFecha(adjunto.fechaCarga)}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                descargarAdjunto(adjunto.id, adjunto.nombreArchivoOriginal)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistorialPanel({ historial }: { historial: BitacoraTicket[] }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <History className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Historial</h2>
      </div>

      {historial.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            No hay movimientos registrados para este ticket.
          </p>
        </div>
      )}

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {historial.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 p-4 md:grid-cols-[160px_1fr]"
          >
            <div className="text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {formatearFecha(item.fechaRegistro)}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900">{item.accion}</p>
              <p className="mt-1 text-sm text-slate-600">{item.detalle}</p>
              <p className="mt-2 text-xs text-slate-400">{item.usuario}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}