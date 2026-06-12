"use client";

import BitacoraSection from "@/components/catalogos/BitacoraSection";
import CatalogosTabs, {
  type TabCatalogo,
} from "@/components/catalogos/CatalogosTabs";
import CategoriasSection from "@/components/catalogos/CategoriasSection";
import ConfiguracionSlaSection from "@/components/catalogos/ConfiguracionSlaSection";
import MatrizSection from "@/components/catalogos/MatrizSection";
import PrioridadesSection from "@/components/catalogos/PrioridadesSection";
import type { useCatalogos } from "@/hooks/useCatalogos";
import { useState } from "react";

type CatalogosHook = ReturnType<typeof useCatalogos>;

interface CatalogosContentProps {
  catalogos: CatalogosHook;
}

export default function CatalogosContent({ catalogos }: CatalogosContentProps) {
  const [tabActivo, setTabActivo] = useState<TabCatalogo>("categorias");

  return (
    <div className="space-y-5">
      <CatalogosTabs
        tabActivo={tabActivo}
        onCambiarTab={setTabActivo}
        totales={{
          categorias: catalogos.categorias.length,
          prioridades: catalogos.prioridades.length,
          matriz: catalogos.matrizPrioridad.length,
          sla: catalogos.configuracionSla ? 1 : 0,
          bitacora: catalogos.bitacoraSistema.length,
        }}
      />

      {tabActivo === "categorias" && (
        <CategoriasSection catalogos={catalogos} />
      )}

      {tabActivo === "prioridades" && (
        <PrioridadesSection catalogos={catalogos} />
      )}

      {tabActivo === "matriz" && <MatrizSection catalogos={catalogos} />}

      {tabActivo === "sla" && <ConfiguracionSlaSection catalogos={catalogos} />}

      {tabActivo === "bitacora" && <BitacoraSection catalogos={catalogos} />}
    </div>
  );
}