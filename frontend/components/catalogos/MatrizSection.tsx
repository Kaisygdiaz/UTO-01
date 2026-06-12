"use client";

import CatalogosSectionCard from "@/components/catalogos/CatalogosSectionCard";
import EstadoCatalogoBadge from "@/components/catalogos/EstadoCatalogoBadge";
import type { useCatalogos } from "@/hooks/useCatalogos";

type CatalogosHook = ReturnType<typeof useCatalogos>;

interface MatrizSectionProps {
  catalogos: CatalogosHook;
}

export default function MatrizSection({ catalogos }: MatrizSectionProps) {
  const prioridadesActivas = catalogos.prioridades.filter(
    (prioridad) => prioridad.activo
  );

  return (
    <CatalogosSectionCard
      titulo="Matriz impacto + urgencia"
      descripcion="Define la prioridad automática según el impacto y la urgencia del incidente."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 text-left font-semibold">Impacto</th>
              <th className="px-4 py-3 text-left font-semibold">Urgencia</th>
              <th className="px-4 py-3 text-left font-semibold">
                Prioridad actual
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                Cambiar prioridad
              </th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {catalogos.matrizPrioridad.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No hay combinaciones de matriz registradas.
                </td>
              </tr>
            ) : (
              catalogos.matrizPrioridad.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${obtenerEstiloImpacto(
                        item.impacto
                      )}`}
                    >
                      {item.impacto}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${obtenerEstiloUrgencia(
                        item.urgencia
                      )}`}
                    >
                      {item.urgencia}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${obtenerEstiloPrioridad(
                        item.prioridad
                      )}`}
                    >
                      {item.prioridad}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <select
                      value={item.prioridadId}
                      disabled={catalogos.guardando}
                      onChange={(event) =>
                        catalogos.guardarMatrizPrioridad(
                          item.id,
                          Number(event.target.value)
                        )
                      }
                      className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {prioridadesActivas.map((prioridad) => (
                        <option key={prioridad.id} value={prioridad.id}>
                          {prioridad.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-4">
                    <EstadoCatalogoBadge activo={item.activo} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CatalogosSectionCard>
  );
}

function obtenerEstiloImpacto(impacto: string) {
  const texto = impacto.toLowerCase();

  if (texto.includes("alto")) {
    return "bg-red-50 text-red-700";
  }

  if (texto.includes("medio")) {
    return "bg-amber-50 text-amber-700";
  }

  if (texto.includes("bajo")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function obtenerEstiloUrgencia(urgencia: string) {
  const texto = urgencia.toLowerCase();

  if (texto.includes("alta")) {
    return "bg-red-50 text-red-700";
  }

  if (texto.includes("media")) {
    return "bg-amber-50 text-amber-700";
  }

  if (texto.includes("baja")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function obtenerEstiloPrioridad(prioridad: string) {
  const texto = prioridad
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto.includes("critica")) {
    return "bg-red-50 text-red-700";
  }

  if (texto.includes("alta")) {
    return "bg-orange-50 text-orange-700";
  }

  if (texto.includes("media")) {
    return "bg-amber-50 text-amber-700";
  }

  if (texto.includes("baja")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-purple-50 text-purple-700";
}