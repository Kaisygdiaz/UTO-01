"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import type { UsuarioAutenticado } from "@/types/auth";
import MenuLateral from "@/components/MenuLateral";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuContraido, setMenuContraido] = useState(false);

  useEffect(() => {
    const usuarioActual = getUsuario();

    if (!usuarioActual) {
      router.push("/login");
      return;
    }

    const estadoGuardado = localStorage.getItem("menuContraido");

    if (estadoGuardado !== null) {
      setMenuContraido(estadoGuardado === "true");
    }

    setUsuario(usuarioActual);
    setCargando(false);
  }, [router]);

  function alternarMenu() {
    setMenuContraido((valorActual) => {
      const nuevoValor = !valorActual;
      localStorage.setItem("menuContraido", String(nuevoValor));
      return nuevoValor;
    });
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Cargando sistema...</p>
      </main>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <MenuLateral contraido={menuContraido} onToggle={alternarMenu} />

      <div
        className={`transition-[padding] duration-300 ${
          menuContraido ? "pl-20" : "pl-72"
        }`}
      >
        <Header />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}