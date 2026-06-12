"use client";

import AppLayout from "@/components/AppLayout";
import CatalogosContent from "@/components/catalogos/CatalogosContent";
import CatalogosHeader from "@/components/catalogos/CatalogosHeader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import { useCatalogos } from "@/hooks/useCatalogos";
import { CheckCircle2 } from "lucide-react";

export default function CatalogosPage() {
  const catalogos = useCatalogos();

  return (
    <AppLayout>
      <section className="space-y-6">
        <CatalogosHeader />

        {catalogos.cargando && (
          <LoadingState mensaje="Cargando catálogos del sistema..." />
        )}

        {!catalogos.cargando && catalogos.mensajeExito && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {catalogos.mensajeExito}
          </div>
        )}

        {!catalogos.cargando && catalogos.error && (
          <ErrorMessage mensaje={catalogos.error} />
        )}

        {!catalogos.cargando && <CatalogosContent catalogos={catalogos} />}
      </section>
    </AppLayout>
  );
}