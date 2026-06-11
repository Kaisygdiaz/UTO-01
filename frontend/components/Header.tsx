"use client";

import { getUsuario } from "@/lib/auth";

export default function Header() {
  const usuario = getUsuario();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Sistema de Gestión de Incidentes
        </h2>
        <p className="text-sm text-slate-500">
          Administración y seguimiento de tickets tecnológicos
        </p>
      </div>

      {usuario && (
        <div className="text-right">
          <p className="font-semibold text-slate-900">
            {usuario.nombreCompleto}
          </p>
          <p className="text-sm text-slate-500">{usuario.rol}</p>
        </div>
      )}
    </header>
  );
}