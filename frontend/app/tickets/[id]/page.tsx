"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import TicketDetailWorkspace from "@/components/tickets/detail/TicketDetailWorkspace";
import TicketPropertiesPanel from "@/components/tickets/detail/TicketPropertiesPanel";
import { useTicketDetalle } from "@/hooks/useTicketDetalle";
import { ArrowLeft } from "lucide-react";

export default function TicketDetallePage() {
  const params = useParams();
  const id = Number(params.id);

  const {
    ticket,
    bitacora,
    comentarios,
    adjuntos,
    tecnicos,
    cargando,
    guardandoComentario,
    subiendoAdjunto,
    asignandoTicket,
    cambiandoEstado,
    error,
    agregarComentario,
    subirAdjunto,
    asignarTecnico,
    resolver,
    cerrar,
    reabrir,
    cancelar,
    escalar,
  } = useTicketDetalle(id);

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

        {cargando && <LoadingState mensaje="Cargando detalle del ticket..." />}

        <ErrorMessage mensaje={error} />

        {!cargando && !error && ticket && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <TicketDetailWorkspace
              ticket={ticket}
              comentarios={comentarios}
              adjuntos={adjuntos}
              historial={bitacora}
              tecnicos={tecnicos}
              guardandoComentario={guardandoComentario}
              subiendoAdjunto={subiendoAdjunto}
              asignandoTicket={asignandoTicket}
              cambiandoEstado={cambiandoEstado}
              onAgregarComentario={agregarComentario}
              onSubirAdjunto={subirAdjunto}
              onAsignarTecnico={asignarTecnico}
              onResolver={resolver}
              onCerrarTicket={cerrar}
              onReabrir={reabrir}
              onCancelar={cancelar}
              onEscalar={escalar}
            />

            <div className="xl:sticky xl:top-24 xl:self-start">
              <TicketPropertiesPanel ticket={ticket} />
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  );
}