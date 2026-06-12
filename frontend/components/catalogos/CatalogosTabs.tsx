import {
  ClipboardList,
  GitBranch,
  Layers,
  Settings,
  ShieldCheck,
} from "lucide-react";

type TabCatalogo =
  | "categorias"
  | "prioridades"
  | "matriz"
  | "sla"
  | "bitacora";

interface CatalogosTabsProps {
  tabActivo: TabCatalogo;
  onCambiarTab: (tab: TabCatalogo) => void;
  totales: {
    categorias: number;
    prioridades: number;
    matriz: number;
    sla: number;
    bitacora: number;
  };
}

export default function CatalogosTabs({
  tabActivo,
  onCambiarTab,
  totales,
}: CatalogosTabsProps) {
  const tabs = [
    {
      id: "categorias" as const,
      nombre: "Categorías",
      total: totales.categorias,
      icono: Layers,
    },
    {
      id: "prioridades" as const,
      nombre: "Prioridades",
      total: totales.prioridades,
      icono: ShieldCheck,
    },
    {
      id: "matriz" as const,
      nombre: "Matriz prioridad",
      total: totales.matriz,
      icono: GitBranch,
    },
    {
      id: "sla" as const,
      nombre: "Configuración SLA",
      total: totales.sla,
      icono: Settings,
    },
    {
      id: "bitacora" as const,
      nombre: "Historial del sistema",
      total: totales.bitacora,
      icono: ClipboardList,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {tabs.map((tab) => {
        const Icono = tab.icono;
        const activo = tabActivo === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onCambiarTab(tab.id)}
            className={`rounded-2xl border px-5 py-4 text-left transition ${
              activo
                ? "border-blue-200 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`rounded-xl p-2 ${
                  activo
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icono className="h-5 w-5" />
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  activo
                    ? "bg-white text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.total}
              </span>
            </div>

            <p
              className={`mt-3 text-sm font-bold ${
                activo ? "text-blue-800" : "text-slate-800"
              }`}
            >
              {tab.nombre}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export type { TabCatalogo };