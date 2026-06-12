"use client";

import CatalogosSectionCard from "@/components/catalogos/CatalogosSectionCard";
import type { useCatalogos } from "@/hooks/useCatalogos";
import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

type CatalogosHook = ReturnType<typeof useCatalogos>;

interface BitacoraSectionProps {
  catalogos: CatalogosHook;
}

interface CambioDetalle {
  campo: string;
  anterior: string;
  nuevo: string;
}

export default function BitacoraSection({ catalogos }: BitacoraSectionProps) {
  const [busqueda, setBusqueda] = useState("");
  const [moduloSeleccionado, setModuloSeleccionado] = useState("Todos");

  const modulos = useMemo(() => {
    const modulosUnicos = Array.from(
      new Set(catalogos.bitacoraSistema.map((item) => item.modulo))
    );

    return ["Todos", ...modulosUnicos];
  }, [catalogos.bitacoraSistema]);

  const registrosFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return catalogos.bitacoraSistema.filter((item) => {
      const coincideModulo =
        moduloSeleccionado === "Todos" || item.modulo === moduloSeleccionado;

      const coincideBusqueda =
        !textoBusqueda ||
        item.usuario.toLowerCase().includes(textoBusqueda) ||
        item.correoUsuario.toLowerCase().includes(textoBusqueda) ||
        item.modulo.toLowerCase().includes(textoBusqueda) ||
        item.accion.toLowerCase().includes(textoBusqueda) ||
        item.detalle.toLowerCase().includes(textoBusqueda);

      return coincideModulo && coincideBusqueda;
    });
  }, [catalogos.bitacoraSistema, busqueda, moduloSeleccionado]);

  return (
    <CatalogosSectionCard
      titulo="Historial del sistema"
      descripcion="Registro general de cambios realizados en catálogos, matriz y configuración."
      accion={
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {registrosFiltrados.length} registros
        </span>
      }
    >
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por usuario, acción, módulo o detalle..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={moduloSeleccionado}
              onChange={(event) => setModuloSeleccionado(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {modulos.map((modulo) => (
                <option key={modulo} value={modulo}>
                  {modulo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {registrosFiltrados.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No se encontraron registros
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Probá con otra búsqueda o seleccioná otro módulo.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="w-[150px] px-5 py-3 text-left font-semibold">
                  Fecha
                </th>
                <th className="w-[190px] px-4 py-3 text-left font-semibold">
                  Usuario
                </th>
                <th className="w-[150px] px-4 py-3 text-left font-semibold">
                  Módulo
                </th>
                <th className="w-[180px] px-4 py-3 text-left font-semibold">
                  Acción
                </th>
                <th className="px-5 py-3 text-left font-semibold">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {registrosFiltrados.slice(0, 25).map((item) => (
                <tr key={item.id} className="align-top hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatearFecha(item.fechaRegistro)}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {item.usuario}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.correoUsuario}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.modulo}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold leading-5 ${obtenerEstiloAccion(
                        item.accion
                      )}`}
                    >
                      {item.accion}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <DetalleCompacto detalle={item.detalle} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CatalogosSectionCard>
  );
}

function DetalleCompacto({ detalle }: { detalle: string }) {
  const resumen = obtenerResumen(detalle);
  const cambios = obtenerCambios(detalle);

  return (
    <div className="max-w-3xl">
      <p className="text-sm leading-6 text-slate-700">{resumen}</p>

      {cambios.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {cambios.map((cambio, index) => (
            <span
              key={`${cambio.campo}-${index}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
            >
              <span className="font-bold text-slate-700">{cambio.campo}:</span>

              <span
                title={cambio.anterior}
                className="max-w-[150px] truncate text-slate-500"
              >
                {cambio.anterior}
              </span>

              <span className="text-slate-400">→</span>

              <span
                title={cambio.nuevo}
                className="max-w-[170px] truncate font-bold text-slate-900"
              >
                {cambio.nuevo}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function obtenerEstiloAccion(accion: string) {
  const texto = accion.toLowerCase();

  if (texto.includes("creada") || texto.includes("creado")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (texto.includes("actualizada") || texto.includes("actualizado")) {
    return "bg-blue-50 text-blue-700";
  }

  if (texto.includes("desactivada") || texto.includes("desactivado")) {
    return "bg-red-50 text-red-700";
  }

  if (texto.includes("activada") || texto.includes("activado")) {
    return "bg-amber-50 text-amber-700";
  }

  if (texto.includes("matriz")) {
    return "bg-purple-50 text-purple-700";
  }

  return "bg-slate-100 text-slate-700";
}

function obtenerResumen(detalle: string) {
  const etiquetas = [
    "Nombre anterior:",
    "Descripción anterior:",
    "Estado anterior:",
    "Prioridad anterior:",
    "Respuesta anterior:",
    "Resolución anterior:",
    "Habilitado anterior:",
    "Intervalo anterior:",
    "Porcentaje anterior:",
  ];

  let posicionCorte = -1;

  etiquetas.forEach((etiqueta) => {
    const posicion = detalle.indexOf(etiqueta);

    if (posicion !== -1 && (posicionCorte === -1 || posicion < posicionCorte)) {
      posicionCorte = posicion;
    }
  });

  const resumen =
    posicionCorte === -1
      ? detalle.trim()
      : detalle.slice(0, posicionCorte).trim();

  return resumen.endsWith(".") ? resumen : `${resumen}.`;
}

function obtenerCambios(detalle: string) {
  const cambios: CambioDetalle[] = [];

  agregarCambio(
    cambios,
    "Nombre",
    detalle.match(/Nombre anterior:\s*'([^']*)',\s*nuevo nombre:\s*'([^']*)'/i)
  );

  agregarCambio(
    cambios,
    "Descripción",
    detalle.match(
      /Descripción anterior:\s*'([^']*)',\s*nueva descripción:\s*'([^']*)'/i
    )
  );

  agregarCambio(
    cambios,
    "Estado",
    detalle.match(/Estado anterior:\s*([^,.]+),\s*nuevo estado:\s*([^,.]+)/i)
  );

  agregarCambio(
    cambios,
    "Prioridad",
    detalle.match(
      /Prioridad anterior:\s*'([^']*)',\s*nueva prioridad:\s*'([^']*)'/i
    )
  );

  agregarCambio(
    cambios,
    "Respuesta",
    detalle.match(/Respuesta anterior:\s*([^,.]+),\s*nueva respuesta:\s*([^,.]+)/i)
  );

  agregarCambio(
    cambios,
    "Resolución",
    detalle.match(
      /Resolución anterior:\s*([^,.]+),\s*nueva resolución:\s*([^,.]+)/i
    )
  );

  agregarCambio(
    cambios,
    "Habilitado",
    detalle.match(/Habilitado anterior:\s*([^,.]+),\s*nuevo:\s*([^,.]+)/i)
  );

  agregarCambio(
    cambios,
    "Intervalo",
    detalle.match(
      /Intervalo anterior:\s*([^,.]+),\s*nuevo intervalo:\s*([^,.]+)/i
    )
  );

  agregarCambio(
    cambios,
    "Porcentaje",
    detalle.match(
      /Porcentaje anterior:\s*([^,.]+),\s*nuevo porcentaje:\s*([^,.]+)/i
    )
  );

  return cambios;
}

function agregarCambio(
  cambios: CambioDetalle[],
  campo: string,
  resultado: RegExpMatchArray | null
) {
  if (!resultado) {
    return;
  }

  const anterior = limpiarValor(resultado[1]);
  const nuevo = limpiarValor(resultado[2]);

  if (normalizar(anterior) === normalizar(nuevo)) {
    return;
  }

  cambios.push({
    campo,
    anterior,
    nuevo,
  });
}

function limpiarValor(valor: string) {
  return valor.trim().replace(/\.$/, "");
}

function normalizar(valor: string) {
  return valor.trim().toLowerCase();
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));
}