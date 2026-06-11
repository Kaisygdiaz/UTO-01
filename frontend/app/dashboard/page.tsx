"use client";

import AppLayout from "@/components/AppLayout";
import { getUsuario } from "@/lib/auth";
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const usuario = getUsuario();

  return (
    <AppLayout>
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bienvenido, {usuario?.nombreCompleto}. Este será el panel principal
            del sistema.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Tickets totales</p>
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-4">--</p>
            <p className="text-xs text-slate-400 mt-1">
              Pendiente de conectar al API
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">En proceso</p>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-4">--</p>
            <p className="text-xs text-slate-400 mt-1">
              Pendiente de conectar al API
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Fuera de SLA</p>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-4">--</p>
            <p className="text-xs text-slate-400 mt-1">
              Pendiente de conectar al API
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Cerrados</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-4">--</p>
            <p className="text-xs text-slate-400 mt-1">
              Pendiente de conectar al API
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Información de sesión
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Usuario</p>
              <p className="font-semibold text-slate-900 mt-1">
                {usuario?.nombreCompleto}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Correo</p>
              <p className="font-semibold text-slate-900 mt-1">
                {usuario?.correo}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Rol</p>
              <p className="font-semibold text-slate-900 mt-1">
                {usuario?.rol}
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}