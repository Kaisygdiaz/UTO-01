"use client";

import { confirmarEmail } from "@/lib/usuarios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MailCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={<PantallaCargando />}>
      <ConfirmarEmailContent />
    </Suspense>
  );
}

function ConfirmarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [cargando, setCargando] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function confirmar() {
      if (!token) {
        setError("El enlace de confirmación no contiene un token válido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        await confirmarEmail(token);

        setConfirmado(true);
      } catch {
        setError(
          "No fue posible confirmar el correo. El enlace puede estar vencido, ya fue utilizado o no es válido."
        );
      } finally {
        setCargando(false);
      }
    }

    confirmar();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-7 py-6 text-center">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ${
              confirmado
                ? "bg-emerald-600 text-white"
                : error
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {cargando ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : confirmado ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : error ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <MailCheck className="h-8 w-8" />
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Confirmación de correo
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Estamos validando el enlace de confirmación enviado a su correo.
          </p>
        </div>

        <div className="space-y-5 px-7 py-6">
          {cargando && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-700">
              Confirmando correo electrónico...
            </div>
          )}

          {!cargando && confirmado && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-700">
              <p className="font-bold">Correo confirmado correctamente.</p>
              <p className="mt-1">
                Su cuenta ya fue validada. Ahora puede iniciar sesión en el
                sistema.
              </p>
            </div>
          )}

          {!cargando && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              <p className="font-bold">No se pudo confirmar el correo.</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

function PantallaCargando() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
        Cargando confirmación de correo...
      </div>
    </main>
  );
}