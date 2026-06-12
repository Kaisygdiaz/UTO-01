"use client";

import { confirmarResetPassword } from "@/lib/usuarios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PantallaCargando />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("El enlace de restablecimiento no contiene un token válido.");
      return;
    }

    if (!nuevaPassword.trim()) {
      setError("La nueva contraseña es obligatoria.");
      return;
    }

    if (nuevaPassword.trim().length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);
      setError("");
      setExito("");

      await confirmarResetPassword(token, nuevaPassword.trim());

      setExito("Contraseña restablecida correctamente. Ya puede iniciar sesión.");

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch {
      setError(
        "No fue posible restablecer la contraseña. El enlace puede estar vencido o ya fue utilizado."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-7 py-6">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <KeyRound className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Restablecer contraseña
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ingrese una nueva contraseña para recuperar el acceso al sistema.
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-5 px-7 py-6">
          {!token && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              El enlace no contiene un token válido.
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {exito && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {exito}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nueva contraseña
            </label>

            <div className="relative">
              <input
                type={mostrarPassword ? "text" : "password"}
                value={nuevaPassword}
                onChange={(event) => setNuevaPassword(event.target.value)}
                disabled={cargando || Boolean(exito)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="Mínimo 6 caracteres"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword((actual) => !actual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {mostrarPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Confirmar contraseña
            </label>

            <div className="relative">
              <input
                type={mostrarConfirmacion ? "text" : "password"}
                value={confirmarPassword}
                onChange={(event) => setConfirmarPassword(event.target.value)}
                disabled={cargando || Boolean(exito)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="Repita la nueva contraseña"
              />

              <button
                type="button"
                onClick={() => setMostrarConfirmacion((actual) => !actual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {mostrarConfirmacion ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando || !token || Boolean(exito)}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Restableciendo..." : "Restablecer contraseña"}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </form>
      </div>
    </main>
  );
}

function PantallaCargando() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
        Cargando formulario de restablecimiento...
      </div>
    </main>
  );
}