"use client";

import { rolesDisponibles } from "@/lib/usuarios";
import type {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  UsuarioSistema,
} from "@/types/usuarios";
import { Mail, X } from "lucide-react";
import { useEffect, useState } from "react";

type CrearUsuarioFormularioDto = Omit<CrearUsuarioDto, "password">;

interface UsuarioFormModalProps {
  usuario: UsuarioSistema | null;
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (
    id: number | null,
    dto: CrearUsuarioFormularioDto | ActualizarUsuarioDto
  ) => Promise<void>;
}

export default function UsuarioFormModal({
  usuario,
  guardando,
  onCerrar,
  onGuardar,
}: UsuarioFormModalProps) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rolId, setRolId] = useState(4);
  const [error, setError] = useState("");

  const editando = Boolean(usuario);

  useEffect(() => {
    if (usuario) {
      setNombreCompleto(usuario.nombreCompleto);
      setCorreo(usuario.correo);
      setTelefono(usuario.telefono ?? "");
      setRolId(usuario.rolId || 4);
    } else {
      setNombreCompleto("");
      setCorreo("");
      setTelefono("");
      setRolId(4);
    }

    setError("");
  }, [usuario]);

  async function manejarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nombreCompleto.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    if (!editando && !correo.trim()) {
      setError("El correo es obligatorio.");
      return;
    }

    if (!editando && !validarCorreo(correo.trim())) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }

    setError("");

    if (editando && usuario) {
      const dto: ActualizarUsuarioDto = {
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono.trim() ? telefono.trim() : null,
        rolId,
      };

      await onGuardar(usuario.id, dto);
      onCerrar();
      return;
    }

    const dto: CrearUsuarioFormularioDto = {
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      telefono: telefono.trim() ? telefono.trim() : null,
      rolId,
    };

    await onGuardar(null, dto);
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editando ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editando
                ? "Actualice la información general y el rol del usuario."
                : "Registre un usuario y envíe un link de activación al correo."}
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {!editando && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Al guardar el usuario se enviará un link de confirmación al
                correo registrado.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(event) => setNombreCompleto(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Ej. Josué David Martínez"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={correo}
                disabled={editando}
                onChange={(event) => setCorreo(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Teléfono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Rol
            </label>
            <select
              value={rolId}
              onChange={(event) => setRolId(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {rolesDisponibles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
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
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando
                ? "Guardando..."
                : editando
                ? "Guardar cambios"
                : "Crear y enviar link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function validarCorreo(correo: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}