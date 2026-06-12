"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import AuthMensajeEstado from "@/components/auth/AuthMensajeEstado";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import { useActivarCuenta } from "@/hooks/useActivarCuenta";

export default function ActivarCuentaForm() {
  const {
    token,
    nuevaPassword,
    confirmarPassword,
    mostrarNuevaPassword,
    mostrarConfirmacion,
    cargando,
    error,
    exito,
    formularioBloqueado,
    setNuevaPassword,
    setConfirmarPassword,
    setMostrarNuevaPassword,
    setMostrarConfirmacion,
    manejarActivacion,
    volverLogin,
  } = useActivarCuenta();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <header className="bg-slate-900 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">Activar cuenta</h1>
                <p className="text-sm text-slate-300">
                  Sistema de Incidentes Tecnológicos UTO
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Crea tu contraseña
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Para finalizar la activación, define una contraseña segura para
                iniciar sesión.
              </p>
            </div>

            {!token && (
              <AuthMensajeEstado
                tipo="error"
                mensaje="El enlace de activación no contiene un token válido. Solicita un nuevo correo de activación."
              />
            )}

            {error && <AuthMensajeEstado tipo="error" mensaje={error} />}
            {exito && <AuthMensajeEstado tipo="exito" mensaje={exito} />}

            <form onSubmit={manejarActivacion} className="space-y-4">
              <AuthPasswordInput
                id="nuevaPassword"
                label="Nueva contraseña"
                value={nuevaPassword}
                placeholder="Ingresa tu contraseña"
                visible={mostrarNuevaPassword}
                disabled={formularioBloqueado}
                onChange={setNuevaPassword}
                onToggleVisible={() =>
                  setMostrarNuevaPassword((valor) => !valor)
                }
              />

              <AuthPasswordInput
                id="confirmarPassword"
                label="Confirmar contraseña"
                value={confirmarPassword}
                placeholder="Confirma tu contraseña"
                visible={mostrarConfirmacion}
                disabled={formularioBloqueado}
                onChange={setConfirmarPassword}
                onToggleVisible={() =>
                  setMostrarConfirmacion((valor) => !valor)
                }
              />

              <button
                type="submit"
                disabled={formularioBloqueado || !token}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {cargando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Activando cuenta...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Activar cuenta
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={volverLogin}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          UTO-01 · Gestión de Incidentes Tecnológicos
        </p>
      </section>
    </main>
  );
}