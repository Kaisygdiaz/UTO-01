"use client";

import type {
  ReporteSlaFiltro,
  ReportesFiltros,
  ReportesOpcionesFiltros,
} from "@/types/reportes";
import { Filter, RotateCcw } from "lucide-react";
import Card from "@/components/ui/Card";

interface ReportesFiltrosProps {
  filtros: ReportesFiltros;
  opciones: ReportesOpcionesFiltros;
  cargando: boolean;
  onActualizarFiltro: <K extends keyof ReportesFiltros>(
    campo: K,
    valor: ReportesFiltros[K]
  ) => void;
  onLimpiar: () => void;
}

const opcionesSla: { value: ReporteSlaFiltro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "dentro", label: "Dentro de SLA" },
  { value: "fuera", label: "Fuera de SLA" },
  { value: "proximo", label: "Próximo a vencer" },
  { value: "sin-sla", label: "Sin SLA" },
];

export default function ReportesFiltros({
  filtros,
  opciones,
  cargando,
  onActualizarFiltro,
  onLimpiar,
}: ReportesFiltrosProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Filtros</h2>
        </div>

        <button
          type="button"
          onClick={onLimpiar}
          disabled={cargando}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CampoFecha
          label="Fecha inicio"
          value={filtros.fechaInicio}
          disabled={cargando}
          onChange={(value) => onActualizarFiltro("fechaInicio", value)}
        />

        <CampoFecha
          label="Fecha fin"
          value={filtros.fechaFin}
          disabled={cargando}
          onChange={(value) => onActualizarFiltro("fechaFin", value)}
        />

        <CampoSelect
          label="Estado"
          value={filtros.estado}
          disabled={cargando}
          opciones={opciones.estados}
          placeholder="Todos los estados"
          onChange={(value) => onActualizarFiltro("estado", value)}
        />

        <CampoSelect
          label="Prioridad"
          value={filtros.prioridad}
          disabled={cargando}
          opciones={opciones.prioridades}
          placeholder="Todas las prioridades"
          onChange={(value) => onActualizarFiltro("prioridad", value)}
        />

        <CampoSelect
          label="Categoría"
          value={filtros.categoria}
          disabled={cargando}
          opciones={opciones.categorias}
          placeholder="Todas las categorías"
          onChange={(value) => onActualizarFiltro("categoria", value)}
        />

        <CampoSelect
          label="Técnico"
          value={filtros.tecnico}
          disabled={cargando}
          opciones={opciones.tecnicos}
          placeholder="Todos los técnicos"
          onChange={(value) => onActualizarFiltro("tecnico", value)}
        />

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            SLA
          </label>

          <select
            value={filtros.sla}
            onChange={(event) =>
              onActualizarFiltro("sla", event.target.value as ReporteSlaFiltro)
            }
            disabled={cargando}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {opcionesSla.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

function CampoFecha({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}

function CampoSelect({
  label,
  value,
  disabled,
  opciones,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  opciones: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="">{placeholder}</option>

        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </div>
  );
}