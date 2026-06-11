"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getUsuario } from "@/lib/auth";
import { obtenerDashboard } from "@/lib/dashboard";
import type { DashboardData } from "@/types/dashboard";
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  CircleDot,
  XCircle,
  BellRing,
} from "lucide-react";

export default function DashboardPage() {
  const usuario = getUsuario();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDashboard() {
      try {
        setError("");
        setCargando(true);

        const data = await obtenerDashboard();

        setDashboard(data);
      } catch {
        setError("No fue posible cargar la información del dashboard.");
      } finally {
        setCargando(false);
      }
    }

    cargarDashboard();
  }, []);

  return (
    <AppLayout>
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bienvenido, {usuario?.nombreCompleto}. Este es el panel principal
            de monitoreo de incidentes tecnológicos.
          </p>
        </div>

        {cargando && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-slate-600">Cargando métricas del dashboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">
            {error}
          </div>
        )}

        {!cargando && !error && dashboard && (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Tickets totales</p>
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.totalTickets}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Total de tickets registrados
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Abiertos</p>
                  <CircleDot className="h-5 w-5 text-sky-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.abiertos}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets pendientes de atención
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">En proceso</p>
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.enProceso}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets actualmente asignados
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Cerrados</p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.cerrados}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets finalizados formalmente
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Resueltos</p>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.resueltos}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets resueltos pendientes de cierre
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Cancelados</p>
                  <XCircle className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.cancelados}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets anulados o no procedentes
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Fuera de SLA</p>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.fueraSla}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets que superaron el tiempo permitido
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Próximos a vencer</p>
                  <BellRing className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mt-4">
                  {dashboard.proximosVencerSla}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tickets cercanos al vencimiento SLA
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
          </>
        )}
      </section>
    </AppLayout>
  );
}