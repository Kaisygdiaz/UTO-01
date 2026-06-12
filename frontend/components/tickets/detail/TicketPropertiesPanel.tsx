"use client";

import { useState, type ReactNode } from "react";
import Card from "@/components/ui/Card";
import TicketReclasificarModal from "@/components/tickets/detail/TicketReclasificarModal";
import { formatearFecha } from "@/utils/dates";
import {
  obtenerEstiloTextoEstado,
  obtenerEstiloTextoImpacto,
  obtenerEstiloTextoPrioridad,
  obtenerEstiloTextoUrgencia,
} from "@/utils/ticketStyles";
import type { TicketDetalle } from "@/types/tickets";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Folder,
  Gauge,
  PencilLine,
  ShieldCheck,
  Timer,
  User,
  UserCheck,
  Zap,
} from "lucide-react";

interface TicketPropertiesPanelProps {
  ticket: TicketDetalle;
  reclasificando: boolean;
  onReclasificar: (
    impacto: string,
    urgencia: string,
    motivoReclasificacion: string
  ) => Promise<void>;
}

export default function TicketPropertiesPanel({
  ticket,
  reclasificando,
  onReclasificar,
}: TicketPropertiesPanelProps) {
  const sla = obtenerEstadoSla(ticket);
  const [modalReclasificarAbierto, setModalReclasificarAbierto] =
    useState(false);

  const ticketBloqueado =
    ticket.estado === "Cerrado" || ticket.estado === "Cancelado";

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Resumen del ticket
          </p>

          <h2 className="mt-1 text-base font-bold text-slate-900">
            Propiedades
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Información operativa para seguimiento, asignación y control del
            incidente.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-slate-200 px-5 py-4">
          <MiniStatus
            label="Estado"
            value={ticket.estado}
            valueClassName={obtenerEstiloTextoEstado(ticket.estado)}
          />

          <MiniStatus
            label="Prioridad"
            value={ticket.prioridad}
            valueClassName={obtenerEstiloTextoPrioridad(ticket.prioridad)}
          />
        </div>

        <div className="divide-y divide-slate-100">
          <PropertyItem
            icono={<Folder />}
            label="Categoría"
            value={ticket.categoria}
          />

          <PropertyItem
            icono={<User />}
            label="Solicitante"
            value={ticket.solicitante}
          />

          <PropertyItem
            icono={<UserCheck />}
            label="Técnico responsable"
            value={ticket.tecnicoAsignado}
            valueClassName={
              tieneValor(ticket.tecnicoAsignado)
                ? "text-slate-800"
                : "text-amber-600"
            }
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Clasificación
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Datos usados para calcular la prioridad del ticket.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalReclasificarAbierto(true)}
              disabled={ticketBloqueado || reclasificando}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <PencilLine className="h-3.5 w-3.5" />
              Reclasificar
            </button>
          </div>

          {ticketBloqueado && (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              No se puede reclasificar un ticket cerrado o cancelado.
            </p>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          <PropertyItem
            icono={<Zap />}
            label="Impacto"
            value={ticket.impacto}
            valueClassName={obtenerEstiloTextoImpacto(ticket.impacto)}
          />

          <PropertyItem
            icono={<Clock />}
            label="Urgencia"
            value={ticket.urgencia}
            valueClassName={obtenerEstiloTextoUrgencia(ticket.urgencia)}
          />

          <PropertyItem
            icono={<Gauge />}
            label="Prioridad calculada"
            value={ticket.prioridad}
            valueClassName={obtenerEstiloTextoPrioridad(ticket.prioridad)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <SectionHeader
          titulo="SLA"
          descripcion="Control de cumplimiento del tiempo de atención."
        />

        <div className="divide-y divide-slate-100">
          <PropertyItem
            icono={sla.icono}
            label="Estado SLA"
            value={sla.texto}
            valueClassName={sla.textClassName}
          />

          <PropertyItem
            icono={<Timer />}
            label="Fecha límite"
            value={formatearFecha(ticket.fechaLimiteSla)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <SectionHeader
          titulo="Fechas"
          descripcion="Trazabilidad temporal del ciclo de vida del ticket."
        />

        <div className="divide-y divide-slate-100">
          <PropertyItem
            icono={<Calendar />}
            label="Creación"
            value={formatearFecha(ticket.fechaCreacion)}
          />

          <PropertyItem
            icono={<Calendar />}
            label="Primera respuesta"
            value={formatearFecha(ticket.fechaPrimeraRespuesta)}
          />

          <PropertyItem
            icono={<Calendar />}
            label="Resolución"
            value={formatearFecha(ticket.fechaResolucion)}
          />

          <PropertyItem
            icono={<Calendar />}
            label="Cierre"
            value={formatearFecha(ticket.fechaCierre)}
          />
        </div>
      </Card>

      <TicketReclasificarModal
        abierto={modalReclasificarAbierto}
        impactoActual={ticket.impacto}
        urgenciaActual={ticket.urgencia}
        procesando={reclasificando}
        onCerrar={() => setModalReclasificarAbierto(false)}
        onReclasificar={onReclasificar}
      />
    </div>
  );
}

interface SectionHeaderProps {
  titulo: string;
  descripcion: string;
}

function SectionHeader({ titulo, descripcion }: SectionHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4">
      <h3 className="text-sm font-bold text-slate-900">{titulo}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{descripcion}</p>
    </div>
  );
}

interface MiniStatusProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function MiniStatus({
  label,
  value,
  valueClassName = "text-slate-900",
}: MiniStatusProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className={`mt-1 text-sm font-bold ${valueClassName}`}>
        {mostrarValor(value)}
      </p>
    </div>
  );
}

interface PropertyItemProps {
  icono: ReactNode;
  label: string;
  value: string | null;
  valueClassName?: string;
}

function PropertyItem({
  icono,
  label,
  value,
  valueClassName = "text-slate-800",
}: PropertyItemProps) {
  return (
    <div className="flex gap-3 px-5 py-4 transition hover:bg-slate-50">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500 [&>svg]:h-4 [&>svg]:w-4">
        {icono}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className={`mt-1 break-words text-sm font-bold ${valueClassName}`}>
          {mostrarValor(value)}
        </p>
      </div>
    </div>
  );
}

function obtenerEstadoSla(ticket: TicketDetalle) {
  if (!ticket.fechaLimiteSla) {
    return {
      texto: "No definido",
      textClassName: "text-slate-500",
      icono: <ShieldCheck />,
    };
  }

  if (ticket.estaFueraSla) {
    return {
      texto: "Vencido",
      textClassName: "text-red-600",
      icono: <AlertTriangle />,
    };
  }

  if (ticket.estaProximoAVencerSla) {
    return {
      texto: "Próximo a vencer",
      textClassName: "text-amber-600",
      icono: <Clock />,
    };
  }

  return {
    texto: "Dentro de SLA",
    textClassName: "text-emerald-600",
    icono: <CheckCircle2 />,
  };
}

function tieneValor(value: string | null) {
  return !!value && value.trim() !== "" && value !== "No definido";
}

function mostrarValor(value: string | null) {
  if (!tieneValor(value)) {
    return "No definido";
  }

  return value;
}