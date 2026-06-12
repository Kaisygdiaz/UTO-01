"use client";

import { CheckCircle2, Clock3 } from "lucide-react";

interface UsuarioActivacionBadgeProps {
  emailConfirmado: boolean;
}

export default function UsuarioActivacionBadge({
  emailConfirmado,
}: UsuarioActivacionBadgeProps) {
  if (emailConfirmado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Activado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pendiente
    </span>
  );
}