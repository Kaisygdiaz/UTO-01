"use client";

import type { UsuarioSistema } from "@/types/usuarios";
import { KeyRound, Mail, X } from "lucide-react";

interface ResetPasswordUsuarioModalProps {
  usuario: UsuarioSistema;
  guardando: boolean;
  onCerrar: () => void;
  onEnviarReset: (usuario: UsuarioSistema) => Promise<void>;
}

export default function ResetPasswordUsuarioModal({
  usuario,
  guardando,
  onCerrar,
  onEnviarReset,
}: ResetPasswordUsuarioModalProps) {
  async function manejarEnvio() {
    await onEnviarReset(usuario);
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <KeyRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Reset password
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Se enviará un link de restablecimiento al correo del usuario.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-bold text-slate-900">
              {usuario.nombreCompleto}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              {usuario.correo}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={manejarEnvio}
              disabled={guardando}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Enviando..." : "Enviar link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}