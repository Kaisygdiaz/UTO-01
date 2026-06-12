"use client";

import { useRouter } from "next/navigation";
import { PlusCircle, Ticket } from "lucide-react";

export default function TicketsHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Ticket className="h-6 w-6" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Mesa de ayuda
            </p>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Gestión de tickets
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Administre y dé seguimiento a los incidentes tecnológicos
            registrados en la unidad.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/tickets/nuevo")}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <PlusCircle className="h-4 w-4" />
        Nuevo ticket
      </button>
    </div>
  );
}