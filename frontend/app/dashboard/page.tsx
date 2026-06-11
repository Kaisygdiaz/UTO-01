"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import DashboardCard from "@/components/dashboard/DashboardCard";
import SessionInfo from "@/components/dashboard/SessionInfo";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import { getUsuario } from "@/lib/auth";
import { obtenerDashboard } from "@/lib/dashboard";
import type { DashboardData } from "@/types/dashboard";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock,
  XCircle,
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
        setDashboard(await obtenerDashboard());
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
            Bienvenido, {usuario?.nombreCompleto}. Este es el panel principal de
            monitoreo de incidentes tecnológicos.
          </p>
        </div>

        {cargando && <LoadingState mensaje="Cargando métricas del dashboard..." />}

        <ErrorMessage mensaje={error} />

        {!cargando && !error && dashboard && (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <DashboardCard titulo="Tickets totales" valor={dashboard.totalTickets} descripcion="Total de tickets registrados" icono={ClipboardList} iconColor="text-blue-600" />
              <DashboardCard titulo="Abiertos" valor={dashboard.abiertos} descripcion="Tickets pendientes de atención" icono={CircleDot} iconColor="text-sky-600" />
              <DashboardCard titulo="En proceso" valor={dashboard.enProceso} descripcion="Tickets actualmente asignados" icono={Clock} iconColor="text-amber-600" />
              <DashboardCard titulo="Cerrados" valor={dashboard.cerrados} descripcion="Tickets finalizados formalmente" icono={CheckCircle2} iconColor="text-emerald-600" />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <DashboardCard titulo="Resueltos" valor={dashboard.resueltos} descripcion="Tickets resueltos pendientes de cierre" icono={CheckCircle2} iconColor="text-green-600" />
              <DashboardCard titulo="Cancelados" valor={dashboard.cancelados} descripcion="Tickets anulados o no procedentes" icono={XCircle} iconColor="text-slate-600" />
              <DashboardCard titulo="Fuera de SLA" valor={dashboard.fueraSla} descripcion="Tickets que superaron el tiempo permitido" icono={AlertTriangle} iconColor="text-red-600" />
              <DashboardCard titulo="Próximos a vencer" valor={dashboard.proximosVencerSla} descripcion="Tickets cercanos al vencimiento SLA" icono={BellRing} iconColor="text-orange-600" />
            </div>

            <SessionInfo usuario={usuario} />
          </>
        )}
      </section>
    </AppLayout>
  );
}