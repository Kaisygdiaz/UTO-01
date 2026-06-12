"use client";

import AppLayout from "@/components/AppLayout";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import UsuariosHeader from "@/components/usuarios/UsuariosHeader";
import UsuariosTable from "@/components/usuarios/UsuariosTable";
import { useUsuarios } from "@/hooks/useUsuarios";
import { CheckCircle2 } from "lucide-react";

export default function UsuariosPage() {
  const usuariosHook = useUsuarios();

  return (
    <AppLayout>
      <section className="space-y-6">
        <UsuariosHeader />

        {usuariosHook.cargando && (
          <LoadingState mensaje="Cargando usuarios del sistema..." />
        )}

        {!usuariosHook.cargando && usuariosHook.mensajeExito && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {usuariosHook.mensajeExito}
          </div>
        )}

        {!usuariosHook.cargando && usuariosHook.error && (
          <ErrorMessage mensaje={usuariosHook.error} />
        )}

        {!usuariosHook.cargando && <UsuariosTable usuariosHook={usuariosHook} />}
      </section>
    </AppLayout>
  );
}