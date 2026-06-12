import Card from "@/components/ui/Card";
import { formatearFecha } from "@/utils/dates";
import type { BitacoraTicket } from "@/types/tickets";
import { ClipboardList } from "lucide-react";

interface TicketBitacoraProps {
  bitacora: BitacoraTicket[];
}

export default function TicketBitacora({ bitacora }: TicketBitacoraProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Bitácora</h2>
      </div>

      <div className="mt-5 space-y-4">
        {bitacora.length === 0 && (
          <p className="text-slate-500">No hay movimientos registrados.</p>
        )}

        {bitacora.map((item) => (
          <div key={item.id} className="border-l-4 border-blue-600 pl-4">
            <p className="font-semibold text-slate-900">{item.accion}</p>

            <p className="mt-1 text-sm text-slate-600">{item.detalle}</p>

            <p className="mt-2 text-xs text-slate-400">
              {item.usuario} · {formatearFecha(item.fechaRegistro)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}