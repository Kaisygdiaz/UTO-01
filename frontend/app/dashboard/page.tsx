"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsuario, logout } from "@/lib/auth";
import type { UsuarioAutenticado } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  useEffect(() => {
    const usuarioActual = getUsuario();

    if (!usuarioActual) {
      router.push("/login");
      return;
    }

    setUsuario(usuarioActual);
  }, [router]);

  function cerrarSesion() {
    logout();
    router.push("/login");
  }

  if (!usuario) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard UTO
            </h1>
            <p className="text-slate-500 mt-1">
              Sesión iniciada correctamente.
            </p>
          </div>

          <button
            onClick={cerrarSesion}
            className="rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Usuario</p>
            <p className="mt-1 font-semibold text-slate-900">
              {usuario.nombreCompleto}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Correo</p>
            <p className="mt-1 font-semibold text-slate-900">
              {usuario.correo}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Rol</p>
            <p className="mt-1 font-semibold text-slate-900">
              {usuario.rol}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}