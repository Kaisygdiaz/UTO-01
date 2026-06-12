"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Save, X } from "lucide-react";

interface TicketReclasificarModalProps {
  abierto: boolean;
  impactoActual: string;
  urgenciaActual: string;
  procesando: boolean;
  onCerrar: () => void;
  onReclasificar: (
    impacto: string,
    urgencia: string,
    motivoReclasificacion: string
  ) => Promise<void>;
}

const impactos = ["Bajo", "Medio", "Alto"];
const urgencias = ["Baja", "Media", "Alta"];

export default function TicketReclasificarModal({
  abierto,
  impactoActual,
  urgenciaActual,
  procesando,
  onCerrar,
  onReclasificar,
}: TicketReclasificarModalProps) {
  const [impacto, setImpacto] = useState(impactoActual || "Bajo");
  const [urgencia, setUrgencia] = useState(urgenciaActual || "Baja");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto) {
      setImpacto(impactoActual || "Bajo");
      setUrgencia(urgenciaActual || "Baja");
      setMotivo("");
      setError("");
    }
  }, [abierto, impactoActual, urgenciaActual]);

  if (!abierto) {
    return null;
  }

  async function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!impacto.trim()) {
      setError("Debe seleccionar el impacto.");
      return;
    }

    if (!urgencia.trim()) {
      setError("Debe seleccionar la urgencia.");
      return;
    }

    if (!motivo.trim()) {
      setError("Debe ingresar el motivo de reclasificación.");
      return;
    }

    if (motivo.trim().length < 10) {
      setError("El motivo debe tener al menos 10 caracteres.");
      return;
    }

    try {
      await onReclasificar(impacto, urgencia, motivo.trim());
      onCerrar();
    } catch {
      setError(
        "No fue posible reclasificar el ticket. Verifique los datos o permisos."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Reclasificar ticket
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Cambie impacto y urgencia. La prioridad se recalculará con la
              matriz configurada.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Impacto
              </label>

              <select
                value={impacto}
                onChange={(event) => setImpacto(event.target.value)}
                disabled={procesando}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {impactos.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Urgencia
              </label>

              <select
                value={urgencia}
                onChange={(event) => setUrgencia(event.target.value)}
                disabled={procesando}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {urgencias.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">
              Motivo de reclasificación
            </label>

            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              disabled={procesando}
              rows={4}
              placeholder="Explique por qué se cambia la clasificación del ticket..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <p className="mt-1 text-xs text-slate-500">
              Este motivo quedará registrado en el historial del ticket.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCerrar}
              disabled={procesando}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={procesando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {procesando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reclasificando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar reclasificación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}