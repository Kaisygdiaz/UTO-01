"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { getUsuario, logout } from "@/lib/auth";

const rolesAdministrativos = ["Administrador", "Jefe DTI"];
const rolesTodos = ["Administrador", "Jefe DTI", "Técnico", "Solicitante"];

const opcionesBase = [
  {
    nombre: "Dashboard",
    href: "/dashboard",
    icono: LayoutDashboard,
    roles: rolesAdministrativos,
  },
  {
    nombre: "Tickets",
    href: "/tickets",
    icono: Ticket,
    roles: rolesTodos,
  },
  {
    nombre: "Usuarios",
    href: "/usuarios",
    icono: Users,
    roles: rolesAdministrativos,
  },
  {
    nombre: "Catálogos",
    href: "/catalogos",
    icono: Settings,
    roles: rolesAdministrativos,
  },
  {
    nombre: "Reportes",
    href: "/reportes",
    icono: BarChart3,
    roles: rolesAdministrativos,
  },
];

const opcionesCuenta = [
  {
    nombre: "Cambiar contraseña",
    href: "/cambiar-password",
    icono: KeyRound,
    roles: rolesTodos,
  },
];

interface MenuLateralProps {
  contraido: boolean;
  onToggle: () => void;
}

export default function MenuLateral({
  contraido,
  onToggle,
}: MenuLateralProps) {
  const pathname = usePathname();
  const router = useRouter();
  const usuario = getUsuario();

  const opciones = opcionesBase.filter((opcion) =>
    usuario ? opcion.roles.includes(usuario.rol) : false
  );

  const opcionesUsuario = opcionesCuenta.filter((opcion) =>
    usuario ? opcion.roles.includes(usuario.rol) : false
  );

  function cerrarSesion() {
    logout();
    router.push("/login");
  }

  const inicialUsuario =
    usuario?.nombreCompleto?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-slate-950 text-white shadow-xl transition-all duration-300 ease-in-out no-print ${
        contraido ? "w-20" : "w-72"
      }`}
    >
      <div className="border-b border-slate-800 px-4 py-5">
        <div
          className={`flex items-center ${
            contraido ? "justify-center" : "justify-between gap-3"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>

            {!contraido && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold leading-tight">
                  UTO Incidentes
                </h1>
                <p className="text-xs text-slate-400">Mesa de ayuda</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onToggle}
            title={contraido ? "Expandir menú" : "Contraer menú"}
            className={`group relative flex items-center rounded-xl border border-slate-800 bg-slate-900 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white ${
              contraido
                ? "mx-auto h-11 w-11 justify-center"
                : "w-full justify-center gap-2 px-4 py-2.5"
            }`}
          >
            {contraido ? (
              <>
                <ChevronRight className="h-5 w-5" />
                <Tooltip texto="Expandir menú" />
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Contraer menú</span>
              </>
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-5">
        {opciones.map((opcion) => {
          const Icono = opcion.icono;
          const activo =
            pathname === opcion.href || pathname.startsWith(`${opcion.href}/`);

          return (
            <Link
              key={opcion.href}
              href={opcion.href}
              title={contraido ? opcion.nombre : undefined}
              className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                contraido ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
              } ${
                activo
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icono className="h-5 w-5 shrink-0" />

              {!contraido && <span>{opcion.nombre}</span>}

              {contraido && <Tooltip texto={opcion.nombre} />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-slate-800 px-3 py-5">
        {opcionesUsuario.map((opcion) => {
          const Icono = opcion.icono;
          const activo =
            pathname === opcion.href || pathname.startsWith(`${opcion.href}/`);

          return (
            <Link
              key={opcion.href}
              href={opcion.href}
              title={contraido ? opcion.nombre : undefined}
              className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                contraido ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
              } ${
                activo
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icono className="h-5 w-5 shrink-0" />

              {!contraido && <span>{opcion.nombre}</span>}

              {contraido && <Tooltip texto={opcion.nombre} />}
            </Link>
          );
        })}

        {!contraido && usuario && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="truncate text-sm font-bold text-white">
              {usuario.nombreCompleto}
            </p>
            <p className="truncate text-xs text-slate-400">{usuario.rol}</p>
          </div>
        )}

        {contraido && usuario && (
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-sm font-bold text-slate-200">
            {inicialUsuario}
          </div>
        )}

        <button
          type="button"
          onClick={cerrarSesion}
          title={contraido ? "Cerrar sesión" : undefined}
          className={`group relative flex w-full items-center rounded-xl text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-600 hover:text-white ${
            contraido ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />

          {!contraido && <span>Cerrar sesión</span>}

          {contraido && <Tooltip texto="Cerrar sesión" />}
        </button>
      </div>
    </aside>
  );
}

function Tooltip({ texto }: { texto: string }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg ring-1 ring-slate-700 transition-opacity duration-200 group-hover:opacity-100">
      {texto}
    </span>
  );
}