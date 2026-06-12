"use client";

import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import NuevoTicketForm from "@/components/tickets/nuevo/NuevoTicketForm";
import NuevoTicketResumen from "@/components/tickets/nuevo/NuevoTicketResumen";
import { useNuevoTicket } from "@/hooks/useNuevoTicket";
import { ArrowLeft, FileText } from "lucide-react";

export default function NuevoTicketPage() {
  const nuevoTicket = useNuevoTicket();

  return (
    <AppLayout>
      <section className="space-y-5">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a tickets
        </Link>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Mesa de ayuda
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Crear nuevo ticket
            </h1>

            <p className="text-sm text-slate-500">
              Registre una incidencia o solicitud de soporte tecnológico.
            </p>
          </div>
        </div>

        {nuevoTicket.cargandoCatalogos && (
          <LoadingState mensaje="Cargando información del formulario..." />
        )}

        <ErrorMessage mensaje={nuevoTicket.error} />

        {!nuevoTicket.cargandoCatalogos && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <NuevoTicketForm {...nuevoTicket} />
            <NuevoTicketResumen archivo={nuevoTicket.archivo} />
          </div>
        )}
      </section>
    </AppLayout>
  );
}