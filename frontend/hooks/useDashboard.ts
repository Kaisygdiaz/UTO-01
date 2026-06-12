"use client";

import { useCallback, useEffect, useState } from "react";
import { obtenerDashboard } from "@/lib/dashboard";
import type { DashboardData } from "@/types/dashboard";

type ModoCarga = "inicial" | "actualizacion";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarDashboard = useCallback(async (modo: ModoCarga = "inicial") => {
    try {
      if (modo === "inicial") {
        setCargando(true);
      } else {
        setActualizando(true);
      }

      setError("");

      const data = await obtenerDashboard();
      setDashboard(data);
    } catch {
      setError("No fue posible cargar las métricas del dashboard.");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarDashboard("inicial");
  }, [cargarDashboard]);

  return {
    dashboard,
    cargando,
    actualizando,
    error,
    recargarDashboard: () => cargarDashboard("actualizacion"),
  };
}