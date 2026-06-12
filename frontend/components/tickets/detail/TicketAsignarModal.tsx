"use client";

import { useState } from "react";
import type { TecnicoCatalogo } from "@/types/catalogos";
import { UserCheck, X } from "lucide-react";

interface TicketAsignarModalProps {
  abierto: boolean;
  tecnicos: TecnicoCatalogo[];
  asignando: boolean;
  esReasignacion: boolean;
  tecnicoActual: string;
  onCerrar: () => void;
  onAsignar: (tecnicoId: number) => Promise<void>;
}

export default function TicketAsignarModal({
  abierto,
  tecnicos,
  asignando,
  esReasignacion,
  tecnicoActual,
  onCerrar,
  onAsignar,
}: TicketAsignarModalProps) {
  const [tecnicoId, setTecnicoId] = useState("");
  const [error, setError] = useState("");

  if (!abierto) return null;

  async function confirmarAsignacion() {
    try {
      setError("");

      const id = Number(tecnicoId);

      if (!id || Number.isNaN(id)) {
        setError("Debe seleccionar un técnico.");
        return;
      }

      await onAsignar(id);

      setTecnicoId("");
      onCerrar();
    } catch {
      setError(
        esReasignacion
          ? "No fue posible reasignar el ticket."
          : "No fue posible asignar el ticket."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-50 p-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {esReasignacion ? "Reasignar responsable" : "Asignar responsable"}
              </h2>

              <p className="text-xs text-slate-500">
                {esReasignacion
                  ? "El cambio quedará registrado en el historial del ticket."
                  : "Al asignar el ticket, pasará a estado En proceso."}
              </p>
            </div>
          </div>

          <button
            onClick={onCerrar}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {esReasignacion && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Técnico actual:{" "}
              <span className="font-semibold">{tecnicoActual}</span>
            </div>
          )}

          <label className="text-sm font-semibold text-slate-700">
            {esReasignacion ? "Nuevo técnico responsable" : "Técnico responsable"}
          </label>

          <select
            value={tecnicoId}
            onChange={(e) => setTecnicoId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Seleccione un técnico</option>

            {tecnicos.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombreCompleto}
              </option>
            ))}
          </select>

          {tecnicos.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              No hay técnicos disponibles o no fue posible cargarlos.
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onCerrar}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            onClick={confirmarAsignacion}
            disabled={asignando}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {asignando
              ? esReasignacion
                ? "Reasignando..."
                : "Asignando..."
              : esReasignacion
              ? "Reasignar ticket"
              : "Asignar ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}