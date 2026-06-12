"use client";

import { ArrowLeft, KeyRound, Loader2, Save } from "lucide-react";
import AuthMensajeEstado from "@/components/auth/AuthMensajeEstado";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import { useCambiarPassword } from "@/hooks/useCambiarPassword";

export default function CambiarPasswordForm() {
  const {
    passwordActual,
    nuevaPassword,
    confirmarPassword,

    mostrarActual,
    mostrarNueva,
    mostrarConfirmacion,

    guardando,
    error,
    mensajeExito,
    formularioBloqueado,

    setPasswordActual,
    setNuevaPassword,
    setConfirmarPassword,

    setMostrarActual,
    setMostrarNueva,
    setMostrarConfirmacion,

    manejarCambioPassword,
    volver,
  } = useCambiarPassword();

  const nuevaPasswordMuyCorta =
    nuevaPassword.length > 0 && nuevaPassword.length < 6;

  const passwordsNoCoinciden =
    confirmarPassword.length > 0 && nuevaPassword !== confirmarPassword;

  const botonDeshabilitado =
    formularioBloqueado || nuevaPasswordMuyCorta || passwordsNoCoinciden;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <section className="mx-auto w-full max-w-xl">
        <button
          type="button"
          onClick={volver}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-slate-900 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <KeyRound className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold">Cambiar mi contraseña</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Actualiza la contraseña de tu cuenta de acceso.
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Seguridad de la cuenta
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ingresa tu contraseña actual y define una nueva contraseña para
                continuar usando el sistema de forma segura.
              </p>
            </div>

            {error && <AuthMensajeEstado tipo="error" mensaje={error} />}

            {mensajeExito && (
              <AuthMensajeEstado tipo="exito" mensaje={mensajeExito} />
            )}

            <form onSubmit={manejarCambioPassword} className="space-y-4">
              <AuthPasswordInput
                id="passwordActual"
                label="Contraseña actual"
                value={passwordActual}
                placeholder="Ingresa tu contraseña actual"
                visible={mostrarActual}
                disabled={formularioBloqueado}
                onChange={setPasswordActual}
                onToggleVisible={() => setMostrarActual((valor) => !valor)}
              />

              <div>
                <AuthPasswordInput
                  id="nuevaPassword"
                  label="Nueva contraseña"
                  value={nuevaPassword}
                  placeholder="Ingresa tu nueva contraseña"
                  visible={mostrarNueva}
                  disabled={formularioBloqueado}
                  onChange={setNuevaPassword}
                  onToggleVisible={() => setMostrarNueva((valor) => !valor)}
                />

                {nuevaPasswordMuyCorta && (
                  <p className="mt-1 text-xs font-semibold text-amber-600">
                    La nueva contraseña debe tener al menos 6 caracteres.
                  </p>
                )}
              </div>

              <div>
                <AuthPasswordInput
                  id="confirmarPassword"
                  label="Confirmar nueva contraseña"
                  value={confirmarPassword}
                  placeholder="Confirma tu nueva contraseña"
                  visible={mostrarConfirmacion}
                  disabled={formularioBloqueado}
                  onChange={setConfirmarPassword}
                  onToggleVisible={() =>
                    setMostrarConfirmacion((valor) => !valor)
                  }
                />

                {passwordsNoCoinciden && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    Las contraseñas no coinciden.
                  </p>
                )}

                {!passwordsNoCoinciden &&
                  confirmarPassword.length > 0 &&
                  nuevaPassword.length >= 6 && (
                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                      Las contraseñas coinciden.
                    </p>
                  )}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={volver}
                  disabled={guardando}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={botonDeshabilitado}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}