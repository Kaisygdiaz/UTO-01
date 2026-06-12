"use client";

import CategoriaFormModal from "@/components/catalogos/CategoriaFormModal";
import CatalogosSectionCard from "@/components/catalogos/CatalogosSectionCard";
import EstadoCatalogoBadge from "@/components/catalogos/EstadoCatalogoBadge";
import type { useCatalogos } from "@/hooks/useCatalogos";
import type { CategoriaCatalogo } from "@/types/catalogos";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";

type CatalogosHook = ReturnType<typeof useCatalogos>;

interface CategoriasSectionProps {
  catalogos: CatalogosHook;
}

export default function CategoriasSection({
  catalogos,
}: CategoriasSectionProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaCatalogo | null>(null);

  function abrirNuevo() {
    setCategoriaSeleccionada(null);
    setModalAbierto(true);
  }

  function abrirEditar(categoria: CategoriaCatalogo) {
    setCategoriaSeleccionada(categoria);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setCategoriaSeleccionada(null);
  }

  function confirmarCambioEstado(categoria: CategoriaCatalogo) {
    const accion = categoria.activo ? "inactivar" : "activar";

    const confirmado = window.confirm(
      `¿Está seguro de ${accion} la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    catalogos.cambiarActivoCategoria(categoria.id, !categoria.activo);
  }

  return (
    <>
      <CatalogosSectionCard
        titulo="Categorías de incidentes"
        descripcion="Clasificación de los tickets según el tipo de problema reportado."
        accion={
          <button
            type="button"
            onClick={abrirNuevo}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva categoría
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {catalogos.categorias.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No hay categorías registradas.
                  </td>
                </tr>
              ) : (
                catalogos.categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {categoria.nombre}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {categoria.descripcion || "Sin descripción"}
                    </td>

                    <td className="px-4 py-4">
                      <EstadoCatalogoBadge activo={categoria.activo} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditar(categoria)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={catalogos.guardando}
                          onClick={() => confirmarCambioEstado(categoria)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                        >
                          {categoria.activo ? "Inactivar" : "Activar"}
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

      <CategoriaFormModal
        abierto={modalAbierto}
        categoria={categoriaSeleccionada}
        guardando={catalogos.guardando}
        onCerrar={cerrarModal}
        onGuardar={catalogos.guardarCategoria}
      />
    </>
  );
}