import Card from "@/components/ui/Card";
import { formatearFecha } from "@/utils/dates";
import {
  obtenerEstiloTextoEstado,
  obtenerEstiloTextoImpacto,
  obtenerEstiloTextoPrioridad,
  obtenerEstiloTextoUrgencia,
} from "@/utils/ticketStyles";
import type { TicketDetalle } from "@/types/tickets";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Folder,
  Gauge,
  User,
  UserCheck,
  Zap,
} from "lucide-react";

interface TicketPropertiesPanelProps {
  ticket: TicketDetalle;
}

export default function TicketPropertiesPanel({
  ticket,
}: TicketPropertiesPanelProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Propiedades</h2>
      </div>

      <div className="divide-y divide-slate-100">
        <PropertyItem
          icono={<CheckCircle2 />}
          label="Estado"
          value={ticket.estado}
          valueClassName={obtenerEstiloTextoEstado(ticket.estado)}
        />

        <PropertyItem
          icono={<Gauge />}
          label="Prioridad"
          value={ticket.prioridad}
          valueClassName={obtenerEstiloTextoPrioridad(ticket.prioridad)}
        />

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
          label="Técnico"
          value={ticket.tecnicoAsignado}
        />

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
  );
}

interface PropertyItemProps {
  icono: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function PropertyItem({
  icono,
  label,
  value,
  valueClassName = "text-slate-800",
}: PropertyItemProps) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <div className="mt-0.5 text-slate-400 [&>svg]:h-4 [&>svg]:w-4">
        {icono}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className={`mt-1 text-sm font-bold ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}