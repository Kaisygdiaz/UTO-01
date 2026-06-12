"use client";

import { useEffect, useState } from "react";
import type {
  CategoriaCatalogo,
  CrearActualizarCategoriaDto,
} from "@/types/catalogos";
import { X } from "lucide-react";

interface CategoriaFormModalProps {
  abierto: boolean;
  categoria: CategoriaCatalogo | null;
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (
    id: number | null,
    dto: CrearActualizarCategoriaDto
  ) => Promise<void>;
}

export default function CategoriaFormModal({
  abierto,
  categoria,
  guardando,
  onCerrar,
  onGuardar,
}: CategoriaFormModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion ?? "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [categoria, abierto]);

  async function manejarGuardar() {
    if (!nombre.trim()) {
      return;
    }

    await onGuardar(categoria?.id ?? null, {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
    });

    onCerrar();
  }

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {categoria ? "Editar categoría" : "Nueva categoría"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete la información de la categoría del incidente.
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
              placeholder="Ejemplo: Hardware"
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
              placeholder="Descripción breve de la categoría"
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
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
            disabled={guardando || !nombre.trim()}
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