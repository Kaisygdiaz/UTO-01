"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

type AuthMensajeEstadoProps = {
  tipo: "error" | "exito";
  mensaje: string;
};

export default function AuthMensajeEstado({
  tipo,
  mensaje,
}: AuthMensajeEstadoProps) {
  const esError = tipo === "error";

  return (
    <div
      className={`mb-4 flex gap-3 rounded-lg border px-4 py-3 text-sm ${
        esError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {esError ? (
        <AlertCircle className="h-5 w-5 shrink-0" />
      ) : (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      )}

      <span>{mensaje}</span>
    </div>
  );
}