"use client";

import Card from "@/components/ui/Card";
import { CheckCircle2, FileText, Info, Paperclip } from "lucide-react";

interface NuevoTicketResumenProps {
  archivo: File | null;
}

export default function NuevoTicketResumen({
  archivo,
}: NuevoTicketResumenProps) {
  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <Card>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Resumen</h2>

          <p className="mt-1 text-xs text-slate-500">
            El sistema completará estos datos automáticamente.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <ResumenItem
            icono={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            titulo="Estado inicial"
            descripcion="Abierto"
          />

          <ResumenItem
            icono={<Info className="h-4 w-4 text-blue-600" />}
            titulo="Prioridad"
            descripcion="Calculada automáticamente según impacto y urgencia"
          />

          <ResumenItem
            icono={<FileText className="h-4 w-4 text-slate-600" />}
            titulo="Seguimiento"
            descripcion="Después de crear el ticket, podrá agregar comentarios y adjuntos"
          />

          <ResumenItem
            icono={<Paperclip className="h-4 w-4 text-slate-600" />}
            titulo="Evidencia"
            descripcion={
              archivo
                ? `${archivo.name} · ${formatearTamanoArchivo(archivo.size)}`
                : "Sin archivo adjunto inicial"
            }
          />
        </div>

        <div className="border-t border-slate-200 bg-blue-50 px-5 py-4">
          <p className="text-xs leading-5 text-blue-800">
            Mientras más clara sea la descripción y la evidencia, más rápido
            podrá ser atendido el ticket por el área correspondiente.
          </p>
        </div>
      </Card>
    </aside>
  );
}

function ResumenItem({
  icono,
  titulo,
  descripcion,
}: {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-2">{icono}</div>

      <div>
        <p className="text-sm font-semibold text-slate-900">{titulo}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{descripcion}</p>
      </div>
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