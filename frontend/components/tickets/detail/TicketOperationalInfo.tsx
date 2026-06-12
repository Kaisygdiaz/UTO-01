import Card from "@/components/ui/Card";
import type { TicketDetalle } from "@/types/tickets";
import { Tag, User, UserCheck, Zap, Activity } from "lucide-react";

interface TicketOperationalInfoProps {
  ticket: TicketDetalle;
}

export default function TicketOperationalInfo({
  ticket,
}: TicketOperationalInfoProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-slate-900">
        Información operativa
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoItem
          titulo="Categoría"
          valor={ticket.categoria}
          icono={<Tag className="h-4 w-4" />}
        />

        <InfoItem
          titulo="Solicitante"
          valor={ticket.solicitante}
          icono={<User className="h-4 w-4" />}
        />

        <InfoItem
          titulo="Técnico asignado"
          valor={ticket.tecnicoAsignado}
          icono={<UserCheck className="h-4 w-4" />}
        />

        <InfoItem
          titulo="Impacto"
          valor={ticket.impacto}
          icono={<Activity className="h-4 w-4" />}
        />

        <InfoItem
          titulo="Urgencia"
          valor={ticket.urgencia}
          icono={<Zap className="h-4 w-4" />}
        />

        <InfoItem titulo="Prioridad calculada" valor={ticket.prioridad} />
      </div>
    </Card>
  );
}

interface InfoItemProps {
  titulo: string;
  valor: string;
  icono?: React.ReactNode;
}

function InfoItem({ titulo, valor, icono }: InfoItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icono}
        <span>{titulo}</span>
      </div>

      <p className="mt-1 font-semibold text-slate-900">{valor}</p>
    </div>
  );
}