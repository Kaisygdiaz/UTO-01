"use client";

import { useEffect, useState } from "react";
import type {
  CrearActualizarPrioridadDto,
  PrioridadCatalogo,
} from "@/types/catalogos";
import { X } from "lucide-react";

interface PrioridadFormModalProps {
  abierto: boolean;
  prioridad: PrioridadCatalogo | null;
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (
    id: number | null,
    dto: CrearActualizarPrioridadDto
  ) => Promise<void>;
}

export default function PrioridadFormModal({
  abierto,
  prioridad,
  guardando,
  onCerrar,
  onGuardar,
}: PrioridadFormModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tiempoRespuestaHoras, setTiempoRespuestaHoras] = useState(1);
  const [tiempoResolucionHoras, setTiempoResolucionHoras] = useState(4);

  useEffect(() => {
    if (prioridad) {
      setNombre(prioridad.nombre);
      setDescripcion(prioridad.descripcion ?? "");
      setTiempoRespuestaHoras(prioridad.tiempoRespuestaHoras);
      setTiempoResolucionHoras(prioridad.tiempoResolucionHoras);
    } else {
      setNombre("");
      setDescripcion("");
      setTiempoRespuestaHoras(1);
      setTiempoResolucionHoras(4);
    }
  }, [prioridad, abierto]);

  async function manejarGuardar() {
    if (!nombre.trim()) {
      return;
    }

    await onGuardar(prioridad?.id ?? null, {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      tiempoRespuestaHoras,
      tiempoResolucionHoras,
    });

    onCerrar();
  }

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {prioridad ? "Editar prioridad" : "Nueva prioridad"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Defina el nivel de prioridad y los tiempos SLA asociados.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Nombre
            </span>

            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ejemplo: Crítica"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Descripción
            </span>

            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Descripción breve de la prioridad"
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Tiempo de respuesta
              </span>

              <input
                type="number"
                min={1}
                value={tiempoRespuestaHoras}
                onChange={(event) =>
                  setTiempoRespuestaHoras(Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-slate-500">Horas</p>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Tiempo de resolución
              </span>

              <input
                type="number"
                min={1}
                value={tiempoResolucionHoras}
                onChange={(event) =>
                  setTiempoResolucionHoras(Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-slate-500">Horas</p>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={
              guardando ||
              !nombre.trim() ||
              tiempoRespuestaHoras <= 0 ||
              tiempoResolucionHoras <= 0
            }
            onClick={manejarGuardar}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}