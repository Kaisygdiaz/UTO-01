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

  useEffect(() => {
    const usuarioActual = getUsuario();

    if (!usuarioActual) {
      router.push("/login");
      return;
    }

    setUsuario(usuarioActual);
    setCargando(false);
  }, [router]);

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Cargando sistema...</p>
      </main>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <MenuLateral />

      <div className="pl-72">
        <Header />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}