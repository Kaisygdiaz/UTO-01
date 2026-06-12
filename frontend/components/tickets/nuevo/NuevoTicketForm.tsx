"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import type { UseNuevoTicketReturn } from "@/hooks/useNuevoTicket";
import {
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Send,
  Trash2,
} from "lucide-react";

export default function NuevoTicketForm({
  categorias,
  impactosDisponibles,
  urgenciasDisponibles,
  guardando,
  error,
  mensajeExito,
  titulo,
  setTitulo,
  descripcion,
  setDescripcion,
  categoriaId,
  setCategoriaId,
  impacto,
  setImpacto,
  urgencia,
  setUrgencia,
  archivo,
  setArchivo,
  descripcionAdjunto,
  setDescripcionAdjunto,
  quitarArchivo,
  enviarFormulario,
}: UseNuevoTicketReturn) {
  return (
    <form onSubmit={enviarFormulario}>
      <Card>
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Información del incidente
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete los datos principales para registrar el ticket.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          {mensajeExito && (
            <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
              <p>{mensajeExito} Redirigiendo al detalle...</p>
            </div>
          )}

          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Título
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ejemplo: No puedo acceder al sistema"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Mínimo recomendado: 5 caracteres.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Descripción
            </label>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={6}
              placeholder="Describa el problema, cuándo ocurrió, qué sistema afecta y cualquier detalle importante..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-1 flex justify-between text-xs">
              <span className="text-slate-400">
                Mínimo recomendado: 15 caracteres.
              </span>
              <span
                className={
                  descripcion.trim().length < 15
                    ? "text-amber-600"
                    : "text-emerald-600"
                }
              >
                {descripcion.trim().length} caracteres
              </span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Categoría
              </label>

              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Seleccione</option>

                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Impacto
              </label>

              <select
                value={impacto}
                onChange={(e) => setImpacto(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Seleccione</option>

                {impactosDisponibles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Urgencia
              </label>

              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Seleccione</option>

                {urgenciasDisponibles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-blue-600" />

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Evidencia opcional
                </h3>

                <p className="text-xs text-slate-500">
                  Puede adjuntar una captura, documento o archivo que ayude a
                  entender el problema.
                </p>
              </div>
            </div>

            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />

            <textarea
              value={descripcionAdjunto}
              onChange={(e) => setDescripcionAdjunto(e.target.value)}
              rows={3}
              placeholder="Descripción del archivo adjunto, por ejemplo: captura del error mostrado en pantalla..."
              className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {archivo && (
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    {archivo.name}
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    Tamaño: {formatearTamanoArchivo(archivo.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={quitarArchivo}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar
                </button>
              </div>
            )}
          </div>

          {categorias.length === 0 && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <p>
                No hay categorías disponibles. Verifique que los catálogos estén
                cargados en el backend.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Link
            href="/tickets"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={guardando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {guardando ? "Creando ticket..." : "Crear ticket"}
          </button>
        </div>
      </Card>
    </form>
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