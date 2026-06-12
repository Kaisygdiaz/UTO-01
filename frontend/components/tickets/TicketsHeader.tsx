"use client";

import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

export default function TicketsHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          Mesa de ayuda
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Gestión de tickets
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Administre, consulte y dé seguimiento a los incidentes tecnológicos
          registrados en la unidad.
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/tickets/nuevo")}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <PlusCircle className="h-4 w-4" />
        Nuevo ticket
      </button>
    </div>
  );
}