"use client";

import CatalogosSectionCard from "@/components/catalogos/CatalogosSectionCard";
import EstadoCatalogoBadge from "@/components/catalogos/EstadoCatalogoBadge";
import PrioridadFormModal from "@/components/catalogos/PrioridadFormModal";
import type { useCatalogos } from "@/hooks/useCatalogos";
import type { PrioridadCatalogo } from "@/types/catalogos";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";

type CatalogosHook = ReturnType<typeof useCatalogos>;

interface PrioridadesSectionProps {
  catalogos: CatalogosHook;
}

export default function PrioridadesSection({
  catalogos,
}: PrioridadesSectionProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [prioridadSeleccionada, setPrioridadSeleccionada] =
    useState<PrioridadCatalogo | null>(null);

  function abrirNuevo() {
    setPrioridadSeleccionada(null);
    setModalAbierto(true);
  }

  function abrirEditar(prioridad: PrioridadCatalogo) {
    setPrioridadSeleccionada(prioridad);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setPrioridadSeleccionada(null);
  }

  function confirmarCambioEstado(prioridad: PrioridadCatalogo) {
    const accion = prioridad.activo ? "inactivar" : "activar";

    const confirmado = window.confirm(
      `¿Está seguro de ${accion} la prioridad "${prioridad.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    catalogos.cambiarActivoPrioridad(prioridad.id, !prioridad.activo);
  }

  return (
    <>
      <CatalogosSectionCard
        titulo="Prioridades y tiempos SLA"
        descripcion="Niveles de prioridad con tiempos de respuesta y resolución."
        accion={
          <button
            type="button"
            onClick={abrirNuevo}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva prioridad
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left font-semibold">
                  Prioridad
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Respuesta
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Resolución
                </th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {catalogos.prioridades.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No hay prioridades registradas.
                  </td>
                </tr>
              ) : (
                catalogos.prioridades.map((prioridad) => (
                  <tr key={prioridad.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {prioridad.nombre}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {prioridad.descripcion || "Sin descripción"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {prioridad.tiempoRespuestaHoras} horas
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {prioridad.tiempoResolucionHoras} horas
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <EstadoCatalogoBadge activo={prioridad.activo} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditar(prioridad)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={catalogos.guardando}
                          onClick={() => confirmarCambioEstado(prioridad)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                        >
                          {prioridad.activo ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CatalogosSectionCard>

      <PrioridadFormModal
        abierto={modalAbierto}
        prioridad={prioridadSeleccionada}
        guardando={catalogos.guardando}
        onCerrar={cerrarModal}
        onGuardar={catalogos.guardarPrioridad}
      />
    </>
  );
}