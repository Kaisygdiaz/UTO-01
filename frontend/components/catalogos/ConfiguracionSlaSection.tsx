"use client";

import CatalogosSectionCard from "@/components/catalogos/CatalogosSectionCard";
import type { useCatalogos } from "@/hooks/useCatalogos";
import type { ActualizarConfiguracionSlaDto } from "@/types/catalogos";
import { useEffect, useState } from "react";

type CatalogosHook = ReturnType<typeof useCatalogos>;

interface ConfiguracionSlaSectionProps {
  catalogos: CatalogosHook;
}

export default function ConfiguracionSlaSection({
  catalogos,
}: ConfiguracionSlaSectionProps) {
  const [form, setForm] = useState<ActualizarConfiguracionSlaDto>({
    habilitado: true,
    intervaloRevisionMinutos: 15,
    porcentajeProximoVencimiento: 80,
  });

  useEffect(() => {
    if (catalogos.configuracionSla) {
      setForm({
        habilitado: catalogos.configuracionSla.habilitado,
        intervaloRevisionMinutos:
          catalogos.configuracionSla.intervaloRevisionMinutos,
        porcentajeProximoVencimiento:
          catalogos.configuracionSla.porcentajeProximoVencimiento,
      });
    }
  }, [catalogos.configuracionSla]);

  return (
    <CatalogosSectionCard
      titulo="Configuración SLA"
      descripcion="Parámetros generales para la evaluación y monitoreo de tiempos de servicio."
    >
      <div className="p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-sm font-semibold text-slate-700">
              SLA habilitado
            </span>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.habilitado}
                onChange={(event) =>
                  setForm((actual) => ({
                    ...actual,
                    habilitado: event.target.checked,
                  }))
                }
                className="h-5 w-5"
              />

              <span className="text-sm text-slate-600">
                {form.habilitado ? "Activo" : "Inactivo"}
              </span>
            </div>
          </label>

          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-sm font-semibold text-slate-700">
              Intervalo de revisión
            </span>

            <input
              type="number"
              min={1}
              value={form.intervaloRevisionMinutos}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  intervaloRevisionMinutos: Number(event.target.value),
                }))
              }
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-500">Minutos</p>
          </label>

          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-sm font-semibold text-slate-700">
              Próximo vencimiento
            </span>

            <input
              type="number"
              min={1}
              max={100}
              value={form.porcentajeProximoVencimiento}
              onChange={(event) =>
                setForm((actual) => ({
                  ...actual,
                  porcentajeProximoVencimiento: Number(event.target.value),
                }))
              }
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-500">Porcentaje</p>
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={catalogos.guardando}
            onClick={() => catalogos.guardarConfiguracionSla(form)}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {catalogos.guardando ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </CatalogosSectionCard>
  );
}