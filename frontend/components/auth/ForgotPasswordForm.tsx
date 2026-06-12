"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, MailCheck } from "lucide-react";
import AuthMensajeEstado from "@/components/auth/AuthMensajeEstado";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordForm() {
  const {
    correo,
    cargando,
    error,
    mensajeExito,
    formularioBloqueado,
    setCorreo,
    manejarSolicitud,
  } = useForgotPassword();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <header className="bg-slate-900 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <KeyRound className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold">Recuperar contraseña</h1>
                <p className="text-sm text-slate-300">
                  Sistema de Incidentes Tecnológicos UTO
                </p>
              </div>
            </div>
          </header>

          <div className="px-6 py-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Solicitar restablecimiento
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ingrese su correo electrónico. Si la cuenta existe y está
                activa, recibirá un enlace para crear una nueva contraseña.
              </p>
            </div>

            {error && <AuthMensajeEstado tipo="error" mensaje={error} />}
            {mensajeExito && (
              <AuthMensajeEstado tipo="exito" mensaje={mensajeExito} />
            )}

            <form onSubmit={manejarSolicitud} className="space-y-4">
              <div>
                <label
                  htmlFor="correo"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>

                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  disabled={formularioBloqueado}
                  placeholder="usuario@correo.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={formularioBloqueado}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {cargando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando correo...
                  </>
                ) : (
                  <>
                    <MailCheck className="h-4 w-4" />
                    Enviar enlace
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
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