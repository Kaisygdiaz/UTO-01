"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  ClipboardList,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { logout, getUsuario } from "@/lib/auth";
import { useRouter } from "next/navigation";

const opcionesBase = [
  {
    nombre: "Dashboard",
    href: "/dashboard",
    icono: LayoutDashboard,
    roles: ["Administrador", "Jefe DTI", "Técnico", "Solicitante"],
  },
  {
    nombre: "Tickets",
    href: "/tickets",
    icono: Ticket,
    roles: ["Administrador", "Jefe DTI", "Técnico", "Solicitante"],
  },
  {
    nombre: "Usuarios",
    href: "/usuarios",
    icono: Users,
    roles: ["Administrador", "Jefe DTI"],
  },
  {
    nombre: "Catálogos",
    href: "/catalogos",
    icono: Settings,
    roles: ["Administrador", "Jefe DTI"],
  },
  {
    nombre: "Bitácora",
    href: "/bitacora",
    icono: ClipboardList,
    roles: ["Administrador", "Jefe DTI"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const usuario = getUsuario();

  const opciones = opcionesBase.filter((opcion) =>
    usuario ? opcion.roles.includes(usuario.rol) : false
  );

  function cerrarSesion() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <h1 className="font-bold leading-tight">UTO Incidentes</h1>
            <p className="text-xs text-slate-400">Mesa de ayuda</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-2">
        {opciones.map((opcion) => {
          const Icono = opcion.icono;
          const activo = pathname === opcion.href;

          return (
            <Link
              key={opcion.href}
              href={opcion.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                activo
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icono className="h-5 w-5" />
              {opcion.nombre}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-5 border-t border-slate-800">
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}