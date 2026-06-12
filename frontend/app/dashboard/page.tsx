"use client";

import AppLayout from "@/components/AppLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { dashboard, cargando, actualizando, error, recargarDashboard } =
    useDashboard();

  return (
    <AppLayout>
      <section className="space-y-6">
        <DashboardHeader
          dashboard={dashboard}
          cargando={cargando}
          actualizando={actualizando}
          onActualizar={recargarDashboard}
        />

        {cargando && (
          <LoadingState mensaje="Cargando métricas del dashboard..." />
        )}

        {error && <ErrorMessage mensaje={error} />}

        {!cargando && !error && dashboard && (
          <DashboardContent dashboard={dashboard} />
        )}
      </section>
    </AppLayout>
  );
}