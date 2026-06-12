import Card from "@/components/ui/Card";
import { api } from "@/lib/api";
import { obtenerUrlDescargaAdjunto } from "@/lib/tickets";
import { formatearFecha } from "@/utils/dates";
import type { AdjuntoTicket } from "@/types/tickets";
import { Download, FileText, Paperclip } from "lucide-react";

interface TicketAttachmentsProps {
  ticketId: number;
  adjuntos: AdjuntoTicket[];
}

function formatearTamano(bytes: number) {
  if (bytes <= 0) return "0 KB";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function TicketAttachments({
  ticketId,
  adjuntos,
}: TicketAttachmentsProps) {
  async function descargarAdjunto(adjuntoId: number, nombreArchivo: string) {
    const response = await api.get(obtenerUrlDescargaAdjunto(ticketId, adjuntoId), {
      responseType: "blob",
    });

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
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Adjuntos</h2>
      </div>

      <div className="mt-5 space-y-3">
        {adjuntos.length === 0 && (
          <p className="text-slate-500">
            Este ticket no tiene archivos adjuntos.
          </p>
        )}

        {adjuntos.map((adjunto) => (
          <div
            key={adjunto.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-3">
              <div className="rounded-xl bg-white p-2">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {adjunto.nombreArchivoOriginal}
                </p>

                <p className="text-xs text-slate-500">
                  {formatearTamano(adjunto.tamanoBytes)} · {adjunto.usuario} ·{" "}
                  {formatearFecha(adjunto.fechaCarga)}
                </p>

                {adjunto.descripcion && (
                  <p className="mt-1 text-sm text-slate-600">
                    {adjunto.descripcion}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() =>
                descargarAdjunto(adjunto.id, adjunto.nombreArchivoOriginal)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Download className="h-4 w-4" />
              Descargar
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}