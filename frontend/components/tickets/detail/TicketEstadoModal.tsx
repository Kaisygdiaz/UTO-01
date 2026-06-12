"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, ShieldAlert, X, XCircle } from "lucide-react";

type AccionEstado = "resolver" | "cerrar" | "reabrir" | "cancelar" | "escalar";

interface TicketEstadoModalProps {
  abierto: boolean;
  estadoActual: string;
  procesando: boolean;
  onCerrar: () => void;
  onResolver: (solucion: string) => Promise<void>;
  onCerrarTicket: (
    comentarioCierre: string,
    calificacionSatisfaccion?: number
  ) => Promise<void>;
  onReabrir: (motivoReapertura: string) => Promise<void>;
  onCancelar: (motivoCancelacion: string) => Promise<void>;
  onEscalar: (motivoEscalamiento: string) => Promise<void>;
}

export default function TicketEstadoModal({
  abierto,
  estadoActual,
  procesando,
  onCerrar,
  onResolver,
  onCerrarTicket,
  onReabrir,
  onCancelar,
  onEscalar,
}: TicketEstadoModalProps) {
  const [accion, setAccion] = useState<AccionEstado | "">("");
  const [texto, setTexto] = useState("");
  const [calificacion, setCalificacion] = useState("");
  const [error, setError] = useState("");

  const accionesDisponibles = useMemo(() => {
    const estado = estadoActual.toLowerCase();

    if (estado.includes("abierto")) {
      return ["cancelar"] as AccionEstado[];
    }

    if (estado.includes("proceso")) {
      return ["resolver", "escalar", "cancelar"] as AccionEstado[];
    }

    if (estado.includes("escalado")) {
      return ["resolver", "cancelar"] as AccionEstado[];
    }

    if (estado.includes("resuelto")) {
      return ["cerrar", "reabrir"] as AccionEstado[];
    }

    if (estado.includes("cerrado")) {
      return ["reabrir"] as AccionEstado[];
    }

    return [] as AccionEstado[];
  }, [estadoActual]);

  if (!abierto) return null;

  const accionSeleccionada = obtenerConfiguracionAccion(accion);

  function limpiarFormulario() {
    setAccion("");
    setTexto("");
    setCalificacion("");
    setError("");
  }

  function cerrarModal() {
    limpiarFormulario();
    onCerrar();
  }

  async function confirmarCambioEstado() {
    try {
      setError("");

      if (!accion) {
        setError("Debe seleccionar una acción.");
        return;
      }

      if (!texto.trim()) {
        setError("Debe ingresar una descripción o motivo.");
        return;
      }

      if (accion === "resolver") {
        await onResolver(texto.trim());
      }

      if (accion === "cerrar") {
        const calificacionNumerica = Number(calificacion);

        await onCerrarTicket(
          texto.trim(),
          calificacionNumerica > 0 ? calificacionNumerica : undefined
        );
      }

      if (accion === "reabrir") {
        await onReabrir(texto.trim());
      }

      if (accion === "cancelar") {
        await onCancelar(texto.trim());
      }

      if (accion === "escalar") {
        await onEscalar(texto.trim());
      }

      cerrarModal();
    } catch {
      setError("No fue posible cambiar el estado del ticket.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Cambiar estado del ticket
            </h2>
            <p className="text-xs text-slate-500">
              Estado actual:{" "}
              <span className="font-semibold text-slate-700">
                {estadoActual}
              </span>
            </p>
          </div>

          <button
            onClick={cerrarModal}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {accionesDisponibles.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              No hay acciones disponibles para este estado.
            </div>
          ) : (
            <>
              <label className="text-sm font-semibold text-slate-700">
                Acción disponible
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {accionesDisponibles.map((item) => {
                  const config = obtenerConfiguracionAccion(item);

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setAccion(item);
                        setTexto("");
                        setCalificacion("");
                        setError("");
                      }}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        accion === item
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <config.Icono className={`h-5 w-5 ${config.color}`} />
                        <span className="text-sm font-bold text-slate-900">
                          {config.titulo}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {config.descripcion}
                      </p>
                    </button>
                  );
                })}
              </div>

              {accion && (
                <div className="mt-5">
                  <label className="text-sm font-semibold text-slate-700">
                    {accionSeleccionada.labelCampo}
                  </label>

                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={4}
                    placeholder={accionSeleccionada.placeholder}
                    className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  {accion === "cerrar" && (
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-slate-700">
                        Calificación de satisfacción
                      </label>

                      <select
                        value={calificacion}
                        onChange={(e) => setCalificacion(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Sin calificación</option>
                        <option value="1">1 - Muy baja</option>
                        <option value="2">2 - Baja</option>
                        <option value="3">3 - Regular</option>
                        <option value="4">4 - Buena</option>
                        <option value="5">5 - Excelente</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={cerrarModal}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

          {accionesDisponibles.length > 0 && (
            <button
              onClick={confirmarCambioEstado}
              disabled={procesando}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {procesando ? "Procesando..." : "Confirmar cambio"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function obtenerConfiguracionAccion(accion: AccionEstado | "") {
  if (accion === "resolver") {
    return {
      titulo: "Resolver",
      descripcion: "Registra la solución aplicada al incidente.",
      labelCampo: "Solución aplicada",
      placeholder: "Describa la solución realizada...",
      Icono: CheckCircle2,
      color: "text-emerald-600",
    };
  }

  if (accion === "cerrar") {
    return {
      titulo: "Cerrar",
      descripcion: "Finaliza formalmente el ticket resuelto.",
      labelCampo: "Comentario de cierre",
      placeholder: "Ingrese el comentario final del cierre...",
      Icono: CheckCircle2,
      color: "text-blue-600",
    };
  }

  if (accion === "reabrir") {
    return {
      titulo: "Reabrir",
      descripcion: "Regresa el ticket a atención por una nueva revisión.",
      labelCampo: "Motivo de reapertura",
      placeholder: "Explique por qué se reabre el ticket...",
      Icono: RotateCcw,
      color: "text-amber-600",
    };
  }

  if (accion === "cancelar") {
    return {
      titulo: "Cancelar",
      descripcion: "Cancela el ticket indicando una justificación.",
      labelCampo: "Motivo de cancelación",
      placeholder: "Explique por qué se cancela el ticket...",
      Icono: XCircle,
      color: "text-red-600",
    };
  }

  if (accion === "escalar") {
    return {
      titulo: "Escalar",
      descripcion: "Marca el ticket como escalado por complejidad o prioridad.",
      labelCampo: "Motivo de escalamiento",
      placeholder: "Explique por qué se escala el ticket...",
      Icono: ShieldAlert,
      color: "text-purple-600",
    };
  }

  return {
    titulo: "",
    descripcion: "",
    labelCampo: "Descripción",
    placeholder: "Ingrese una descripción...",
    Icono: CheckCircle2,
    color: "text-blue-600",
  };
}