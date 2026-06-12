"use client";

import { useState, type ReactNode } from "react";
import Card from "@/components/ui/Card";
import TicketPriorityBadge from "@/components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "@/components/tickets/TicketStatusBadge";
import TicketAsignarModal from "./TicketAsignarModal";
import TicketEstadoModal from "./TicketEstadoModal";
import { getUsuario } from "@/lib/auth";
import { api } from "@/lib/api";
import { obtenerUrlDescargaAdjunto } from "@/lib/tickets";
import { formatearFecha } from "@/utils/dates";
import {
  obtenerEstiloEstado,
  obtenerEstiloImpacto,
  obtenerEstiloPrioridad,
  obtenerEstiloUrgencia,
} from "@/utils/ticketStyles";
import type { TecnicoCatalogo } from "@/types/catalogos";
import type {
  AdjuntoTicket,
  BitacoraTicket,
  ComentarioTicket,
  TicketDetalle,
} from "@/types/tickets";
import {
  Clock,
  Download,
  FileText,
  History,
  MessageSquare,
  Paperclip,
  Send,
  XCircle,
} from "lucide-react";

interface TicketDetailWorkspaceProps {
  ticket: TicketDetalle;
  comentarios: ComentarioTicket[];
  adjuntos: AdjuntoTicket[];
  historial: BitacoraTicket[];
  tecnicos: TecnicoCatalogo[];
  guardandoComentario: boolean;
  subiendoAdjunto: boolean;
  asignandoTicket: boolean;
  cambiandoEstado: boolean;
  onAgregarComentario: (comentario: string, esInterno: boolean) => Promise<void>;
  onSubirAdjunto: (archivo: File, descripcion: string) => Promise<void>;
  onAsignarTecnico: (tecnicoId: number) => Promise<void>;
  onResolver: (solucion: string) => Promise<void>;
  onCerrarTicket: (
    comentarioCierre: string,
    calificacionSatisfaccion?: number
  ) => Promise<void>;
  onReabrir: (motivoReapertura: string) => Promise<void>;
  onCancelar: (motivoCancelacion: string) => Promise<void>;
  onEscalar: (motivoEscalamiento: string) => Promise<void>;
}

type TabActiva = "conversaciones" | "detalles" | "adjuntos" | "historial";

export default function TicketDetailWorkspace({
  ticket,
  comentarios,
  adjuntos,
  historial,
  tecnicos,
  guardandoComentario,
  subiendoAdjunto,
  asignandoTicket,
  cambiandoEstado,
  onAgregarComentario,
  onSubirAdjunto,
  onAsignarTecnico,
  onResolver,
  onCerrarTicket,
  onReabrir,
  onCancelar,
  onEscalar,
}: TicketDetailWorkspaceProps) {
  const usuario = getUsuario();
  const rol = usuario?.rol ?? "";

  const esAdministrativo = rol === "Administrador" || rol === "Jefe DTI";
  const esSolicitante = rol === "Solicitante";
  const esTecnico = rol === "Técnico";

  const esTecnicoAsignado =
    esTecnico &&
    normalizar(ticket.tecnicoAsignado) === normalizar(usuario?.nombreCompleto);

  const puedeAsignarResponsable = esAdministrativo;
  const puedeComentarioInterno = esAdministrativo || esTecnico;
  const puedeVerHistorial = !esSolicitante;
  const puedeCambiarEstado =
    esAdministrativo || esTecnicoAsignado || esSolicitante;

  const [tabActiva, setTabActiva] = useState<TabActiva>("conversaciones");
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [modalEstadoAbierto, setModalEstadoAbierto] = useState(false);
  const [modalCancelacionAbierto, setModalCancelacionAbierto] = useState(false);

  const tieneTecnicoAsignado =
    !!ticket.tecnicoAsignado &&
    ticket.tecnicoAsignado.trim() !== "" &&
    ticket.tecnicoAsignado !== "No definido";

  const comentariosVisibles = puedeComentarioInterno
    ? comentarios
    : comentarios.filter((comentario) => !comentario.esInterno);

  function abrirAccionEstado() {
    if (esSolicitante) {
      setModalCancelacionAbierto(true);
      return;
    }

    setModalEstadoAbierto(true);
  }

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
              <span>Técnico: {mostrarValor(ticket.tecnicoAsignado)}</span>
              <span>Creado: {formatearFecha(ticket.fechaCreacion)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {puedeAsignarResponsable && (
              <button
                onClick={() => setModalAsignarAbierto(true)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {tieneTecnicoAsignado ? "Reasignar" : "Asignar"}
              </button>
            )}

            {puedeCambiarEstado && !esEstadoFinal(ticket.estado) && (
              <button
                onClick={abrirAccionEstado}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  esSolicitante
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {esSolicitante ? "Cancelar ticket" : "Cambiar estado"}
              </button>
            )}

            <button
              onClick={() => setTabActiva("conversaciones")}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
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

          {puedeVerHistorial && (
            <TabButton
              activa={tabActiva === "historial"}
              onClick={() => setTabActiva("historial")}
            >
              Historial
            </TabButton>
          )}
        </nav>
      </div>

      <div className="min-h-[420px] bg-white p-6">
        {tabActiva === "conversaciones" && (
          <ConversacionesPanel
            comentarios={comentariosVisibles}
            guardandoComentario={guardandoComentario}
            puedeComentarioInterno={puedeComentarioInterno}
            onAgregarComentario={onAgregarComentario}
          />
        )}

        {tabActiva === "detalles" && <DetallesPanel ticket={ticket} />}

        {tabActiva === "adjuntos" && (
          <AdjuntosPanel
            ticketId={ticket.id}
            adjuntos={adjuntos}
            subiendoAdjunto={subiendoAdjunto}
            onSubirAdjunto={onSubirAdjunto}
          />
        )}

        {tabActiva === "historial" && puedeVerHistorial && (
          <HistorialPanel historial={historial} />
        )}
      </div>

      {puedeAsignarResponsable && (
        <TicketAsignarModal
          abierto={modalAsignarAbierto}
          tecnicos={tecnicos}
          asignando={asignandoTicket}
          esReasignacion={tieneTecnicoAsignado}
          tecnicoActual={ticket.tecnicoAsignado}
          onCerrar={() => setModalAsignarAbierto(false)}
          onAsignar={onAsignarTecnico}
        />
      )}

      {!esSolicitante && (
        <TicketEstadoModal
          abierto={modalEstadoAbierto}
          estadoActual={ticket.estado}
          procesando={cambiandoEstado}
          onCerrar={() => setModalEstadoAbierto(false)}
          onResolver={onResolver}
          onCerrarTicket={onCerrarTicket}
          onReabrir={onReabrir}
          onCancelar={onCancelar}
          onEscalar={onEscalar}
        />
      )}

      {esSolicitante && (
        <CancelarTicketModal
          abierto={modalCancelacionAbierto}
          procesando={cambiandoEstado}
          onCerrar={() => setModalCancelacionAbierto(false)}
          onCancelar={onCancelar}
        />
      )}
    </Card>
  );
}

interface TabButtonProps {
  children: ReactNode;
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
  guardandoComentario,
  puedeComentarioInterno,
  onAgregarComentario,
}: {
  comentarios: ComentarioTicket[];
  guardandoComentario: boolean;
  puedeComentarioInterno: boolean;
  onAgregarComentario: (comentario: string, esInterno: boolean) => Promise<void>;
}) {
  const [comentario, setComentario] = useState("");
  const [esInterno, setEsInterno] = useState(false);
  const [error, setError] = useState("");

  async function enviarComentario() {
    try {
      setError("");

      if (!comentario.trim()) {
        setError("Debe escribir un comentario antes de enviarlo.");
        return;
      }

      await onAgregarComentario(
        comentario.trim(),
        puedeComentarioInterno ? esInterno : false
      );

      setComentario("");
      setEsInterno(false);
    } catch {
      setError("No fue posible guardar el comentario.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Conversaciones</h2>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-semibold text-slate-800">
          Agregar respuesta
        </label>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          placeholder="Escriba una respuesta o actualización del ticket..."
          className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {puedeComentarioInterno ? (
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={esInterno}
                onChange={(e) => setEsInterno(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              Comentario interno
            </label>
          ) : (
            <p className="text-xs text-slate-500">
              Tu respuesta será visible dentro del seguimiento del ticket.
            </p>
          )}

          <button
            onClick={enviarComentario}
            disabled={guardandoComentario}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {guardandoComentario ? "Guardando..." : "Enviar comentario"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}

        {puedeComentarioInterno && esInterno && (
          <p className="mt-3 rounded-lg bg-purple-50 px-3 py-2 text-xs text-purple-700">
            Este comentario será visible únicamente para personal autorizado.
          </p>
        )}
      </div>

      {comentarios.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            Este ticket todavía no tiene conversaciones registradas.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comentarios.map((comentarioItem) => (
          <div
            key={comentarioItem.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {comentarioItem.usuario}
                </p>
                <p className="text-xs text-slate-500">{comentarioItem.rol}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {comentarioItem.tipoComentario}
                </span>

                {comentarioItem.esInterno && (
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Interno
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {comentarioItem.comentario}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              {formatearFecha(comentarioItem.fechaRegistro)}
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
        <DetailItem
          label="Técnico asignado"
          value={mostrarValor(ticket.tecnicoAsignado)}
        />

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

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {mostrarValor(value)}
      </p>
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

      <p className="mt-1 text-sm font-bold">{mostrarValor(value)}</p>
    </div>
  );
}

function formatearTamanoArchivo(bytes: number) {
  if (bytes <= 0) return "0 KB";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function AdjuntosPanel({
  ticketId,
  adjuntos,
  subiendoAdjunto,
  onSubirAdjunto,
}: {
  ticketId: number;
  adjuntos: AdjuntoTicket[];
  subiendoAdjunto: boolean;
  onSubirAdjunto: (archivo: File, descripcion: string) => Promise<void>;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

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

  async function enviarAdjunto() {
    try {
      setError("");

      if (!archivo) {
        setError("Debe seleccionar un archivo.");
        return;
      }

      await onSubirAdjunto(archivo, descripcion);

      setArchivo(null);
      setDescripcion("");
    } catch {
      setError("No fue posible subir el archivo adjunto.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Adjuntos</h2>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-semibold text-slate-800">
          Agregar archivo adjunto
        </label>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_180px]">
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            onClick={enviarAdjunto}
            disabled={subiendoAdjunto}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Paperclip className="h-4 w-4" />
            {subiendoAdjunto ? "Subiendo..." : "Subir archivo"}
          </button>
        </div>

        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          placeholder="Descripción del archivo o evidencia adjunta..."
          className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        {archivo && (
          <p className="mt-2 text-xs text-slate-500">
            Archivo seleccionado:{" "}
            <span className="font-semibold text-slate-700">{archivo.name}</span>
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
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
                  {formatearTamanoArchivo(adjunto.tamanoBytes)} ·{" "}
                  {adjunto.tipoContenido} · {adjunto.usuario} ·{" "}
                  {formatearFecha(adjunto.fechaCarga)}
                </p>

                {adjunto.descripcion && (
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {adjunto.descripcion}
                  </p>
                )}
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
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                {item.detalle}
              </p>
              <p className="mt-2 text-xs text-slate-400">{item.usuario}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CancelarTicketModal({
  abierto,
  procesando,
  onCerrar,
  onCancelar,
}: {
  abierto: boolean;
  procesando: boolean;
  onCerrar: () => void;
  onCancelar: (motivoCancelacion: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  if (!abierto) return null;

  async function confirmarCancelacion() {
    try {
      setError("");

      if (motivo.trim().length < 10) {
        setError("Debe ingresar un motivo de cancelación de al menos 10 caracteres.");
        return;
      }

      await onCancelar(motivo.trim());

      setMotivo("");
      onCerrar();
    } catch {
      setError("No fue posible cancelar el ticket.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Cancelar ticket
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Esta acción registrará la cancelación del ticket con una
                justificación.
              </p>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              className="text-slate-400 transition hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm leading-6 text-red-700">
                Al cancelar el ticket se detendrá su atención. El motivo quedará
                registrado en el sistema.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              Motivo de cancelación
            </label>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder="Explique por qué desea cancelar este ticket..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Volver
          </button>

          <button
            type="button"
            onClick={confirmarCancelacion}
            disabled={procesando}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {procesando ? "Cancelando..." : "Confirmar cancelación"}
          </button>
        </div>
      </div>
    </div>
  );
}

function mostrarValor(value: string | null) {
  if (!value || value.trim() === "" || value === "No definido") {
    return "No definido";
  }

  return value;
}

function esEstadoFinal(estado: string) {
  const estadoNormalizado = normalizar(estado);

  return (
    estadoNormalizado.includes("cerrado") ||
    estadoNormalizado.includes("cancelado")
  );
}

function normalizar(valor?: string | null) {
  return (valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}