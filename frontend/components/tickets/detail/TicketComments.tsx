import Card from "@/components/ui/Card";
import { formatearFecha } from "@/utils/dates";
import type { ComentarioTicket } from "@/types/tickets";
import { MessageSquare } from "lucide-react";

interface TicketCommentsProps {
  comentarios: ComentarioTicket[];
}

export default function TicketComments({ comentarios }: TicketCommentsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Comentarios</h2>
      </div>

      <div className="mt-5 space-y-4">
        {comentarios.length === 0 && (
          <p className="text-slate-500">
            Este ticket todavía no tiene comentarios registrados.
          </p>
        )}

        {comentarios.map((comentario) => (
          <div
            key={comentario.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {comentario.usuario}
                </p>
                <p className="text-xs text-slate-500">{comentario.rol}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {comentario.tipoComentario}
                </span>

                {comentario.esInterno && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Interno
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 text-slate-700">{comentario.comentario}</p>

            <p className="mt-3 text-xs text-slate-400">
              {formatearFecha(comentario.fechaRegistro)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}