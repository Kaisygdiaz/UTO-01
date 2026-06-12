"use client";

import ResetPasswordUsuarioModal from "@/components/usuarios/ResetPasswordUsuarioModal";
import UsuarioActivacionBadge from "@/components/usuarios/UsuarioActivacionBadge";
import UsuarioEstadoBadge from "@/components/usuarios/UsuarioEstadoBadge";
import UsuarioFormModal from "@/components/usuarios/UsuarioFormModal";
import UsuarioRolBadge from "@/components/usuarios/UsuarioRolBadge";
import type { useUsuarios } from "@/hooks/useUsuarios";
import { rolesDisponibles } from "@/lib/usuarios";
import type { UsuarioSistema } from "@/types/usuarios";
import {
  Edit,
  Filter,
  KeyRound,
  MailCheck,
  PlusCircle,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { useMemo, useState } from "react";

type UsuariosHook = ReturnType<typeof useUsuarios>;

interface UsuariosTableProps {
  usuariosHook: UsuariosHook;
}

export default function UsuariosTable({ usuariosHook }: UsuariosTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroActivacion, setFiltroActivacion] = useState("todos");
  const [usuarioFormulario, setUsuarioFormulario] =
    useState<UsuarioSistema | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioResetPassword, setUsuarioResetPassword] =
    useState<UsuarioSistema | null>(null);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuariosHook.usuarios.filter((usuario) => {
      const estadoActivacion = usuario.emailConfirmado
        ? "activado"
        : "pendiente";

      const coincideTexto =
        !texto ||
        usuario.nombreCompleto.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto) ||
        usuario.rol.toLowerCase().includes(texto) ||
        estadoActivacion.includes(texto) ||
        (usuario.telefono ?? "").toLowerCase().includes(texto);

      const coincideRol =
        filtroRol === "todos" || usuario.rolId === Number(filtroRol);

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && usuario.activo) ||
        (filtroEstado === "inactivos" && !usuario.activo);

      const coincideActivacion =
        filtroActivacion === "todos" ||
        (filtroActivacion === "activados" && usuario.emailConfirmado) ||
        (filtroActivacion === "pendientes" && !usuario.emailConfirmado);

      return (
        coincideTexto &&
        coincideRol &&
        coincideEstado &&
        coincideActivacion
      );
    });
  }, [
    busqueda,
    filtroActivacion,
    filtroEstado,
    filtroRol,
    usuariosHook.usuarios,
  ]);

  function abrirNuevoUsuario() {
    setUsuarioFormulario(null);
    setMostrarFormulario(true);
  }

  function abrirEditarUsuario(usuario: UsuarioSistema) {
    setUsuarioFormulario(usuario);
    setMostrarFormulario(true);
  }

  async function confirmarCambioEstado(usuario: UsuarioSistema) {
    const accion = usuario.activo ? "inactivar" : "activar";

    const confirmado = window.confirm(
      `¿Está seguro de ${accion} al usuario ${usuario.nombreCompleto}?`
    );

    if (!confirmado) {
      return;
    }

    await usuariosHook.cambiarActivoUsuario(usuario);
  }

  async function confirmarReenvioActivacion(usuario: UsuarioSistema) {
    const confirmado = window.confirm(
      `¿Desea reenviar el correo de activación a ${usuario.correo}?`
    );

    if (!confirmado) {
      return;
    }

    await usuariosHook.reenviarActivacionUsuario(usuario);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Usuarios registrados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte, registre y administre los accesos al sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNuevoUsuario}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo usuario
          </button>
        </div>

        <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 lg:grid-cols-[1fr_200px_180px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Buscar por nombre, correo, teléfono, rol o activación..."
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroRol}
              onChange={(event) => setFiltroRol(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="todos">Todos los roles</option>
              {rolesDisponibles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          <select
            value={filtroActivacion}
            onChange={(event) => setFiltroActivacion(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="todos">Toda activación</option>
            <option value="activados">Activados</option>
            <option value="pendientes">Pendientes</option>
          </select>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 text-sm">
          <span className="font-semibold text-slate-700">
            {usuariosFiltrados.length} usuario(s) encontrado(s)
          </span>

          <button
            type="button"
            onClick={usuariosHook.cargarUsuarios}
            disabled={usuariosHook.guardando}
            className="text-sm font-bold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Actualizar lista
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold">Correo</th>
                <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold">Rol</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Activación
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No hay usuarios que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {usuario.nombreCompleto}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          ID #{usuario.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {usuario.correo}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {usuario.telefono || "Sin teléfono"}
                    </td>

                    <td className="px-4 py-4">
                      <UsuarioRolBadge rol={usuario.rol} />
                    </td>

                    <td className="px-4 py-4">
                      <UsuarioEstadoBadge activo={usuario.activo} />
                    </td>

                    <td className="px-4 py-4">
                      <UsuarioActivacionBadge
                        emailConfirmado={usuario.emailConfirmado}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditarUsuario(usuario)}
                          disabled={usuariosHook.guardando}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Editar
                        </button>

                        {usuario.emailConfirmado ? (
                          <button
                            type="button"
                            onClick={() => setUsuarioResetPassword(usuario)}
                            disabled={usuariosHook.guardando}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Reset password
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => confirmarReenvioActivacion(usuario)}
                            disabled={usuariosHook.guardando}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <MailCheck className="h-3.5 w-3.5" />
                            Reenviar activación
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => confirmarCambioEstado(usuario)}
                          disabled={usuariosHook.guardando}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            usuario.activo
                              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {usuario.activo ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              Inactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Activar
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarFormulario && (
        <UsuarioFormModal
          usuario={usuarioFormulario}
          guardando={usuariosHook.guardando}
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={usuariosHook.guardarUsuario}
        />
      )}

      {usuarioResetPassword && (
        <ResetPasswordUsuarioModal
          usuario={usuarioResetPassword}
          guardando={usuariosHook.guardando}
          onCerrar={() => setUsuarioResetPassword(null)}
          onEnviarReset={usuariosHook.enviarResetPasswordUsuario}
        />
      )}
    </>
  );
}