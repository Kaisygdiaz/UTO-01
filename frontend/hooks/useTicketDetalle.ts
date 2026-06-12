"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { obtenerTecnicos } from "@/lib/catalogos";
import { getUsuario } from "@/lib/auth";
import {
  asignarTicket,
  cancelarTicket,
  cerrarTicket,
  crearComentarioTicket,
  escalarTicket,
  obtenerAdjuntosTicket,
  obtenerBitacoraTicket,
  obtenerComentariosTicket,
  obtenerTicketPorId,
  reabrirTicket,
  reclasificarTicket,
  resolverTicket,
  subirAdjuntoTicket,
} from "@/lib/tickets";
import type { TecnicoCatalogo } from "@/types/catalogos";
import type {
  AdjuntoTicket,
  BitacoraTicket,
  ComentarioTicket,
  TicketDetalle,
} from "@/types/tickets";

type ApiErrorResponse = {
  mensaje?: string;
  message?: string;
  title?: string;
};

export function useTicketDetalle(id: number) {
  const [ticket, setTicket] = useState<TicketDetalle | null>(null);
  const [bitacora, setBitacora] = useState<BitacoraTicket[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioTicket[]>([]);
  const [adjuntos, setAdjuntos] = useState<AdjuntoTicket[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoCatalogo[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardandoComentario, setGuardandoComentario] = useState(false);
  const [subiendoAdjunto, setSubiendoAdjunto] = useState(false);
  const [asignandoTicket, setAsignandoTicket] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [reclasificandoTicket, setReclasificandoTicket] = useState(false);

  const [error, setError] = useState("");

  const cargarDetalle = useCallback(async () => {
    if (!id || Number.isNaN(id)) {
      setError("El identificador del ticket no es válido.");
      setCargando(false);
      return;
    }

    try {
      setError("");
      setCargando(true);

      const usuario = getUsuario();
      const puedeCargarTecnicos =
        usuario?.rol === "Administrador" || usuario?.rol === "Jefe DTI";

      const ticketData = await obtenerTicketPorId(id);

      const [bitacoraData, comentariosData, adjuntosData, tecnicosData] =
        await Promise.all([
          resolverArregloSeguro(() => obtenerBitacoraTicket(id)),
          resolverArregloSeguro(() => obtenerComentariosTicket(id)),
          resolverArregloSeguro(() => obtenerAdjuntosTicket(id)),
          puedeCargarTecnicos
            ? resolverArregloSeguro(() => obtenerTecnicos())
            : Promise.resolve([]),
        ]);

      setTicket(ticketData);
      setBitacora(bitacoraData);
      setComentarios(comentariosData);
      setAdjuntos(adjuntosData);
      setTecnicos(tecnicosData);
    } catch (err) {
      setTicket(null);
      setError(
        obtenerMensajeError(
          err,
          "No fue posible cargar el detalle del ticket."
        )
      );
    } finally {
      setCargando(false);
    }
  }, [id]);

  const refrescarTicketEHistorial = useCallback(async () => {
    const ticketData = await obtenerTicketPorId(id);
    const bitacoraData = await resolverArregloSeguro(() =>
      obtenerBitacoraTicket(id)
    );

    setTicket(ticketData);
    setBitacora(bitacoraData);
  }, [id]);

  const refrescarComentariosEHistorial = useCallback(async () => {
    const [comentariosData, bitacoraData] = await Promise.all([
      resolverArregloSeguro(() => obtenerComentariosTicket(id)),
      resolverArregloSeguro(() => obtenerBitacoraTicket(id)),
    ]);

    setComentarios(comentariosData);
    setBitacora(bitacoraData);
  }, [id]);

  const refrescarAdjuntosEHistorial = useCallback(async () => {
    const [adjuntosData, bitacoraData] = await Promise.all([
      resolverArregloSeguro(() => obtenerAdjuntosTicket(id)),
      resolverArregloSeguro(() => obtenerBitacoraTicket(id)),
    ]);

    setAdjuntos(adjuntosData);
    setBitacora(bitacoraData);
  }, [id]);

  async function agregarComentario(comentario: string, esInterno: boolean) {
    if (!comentario.trim()) {
      throw new Error("Debe escribir un comentario.");
    }

    try {
      setGuardandoComentario(true);

      await crearComentarioTicket(id, {
        comentario: comentario.trim(),
        esInterno,
      });

      await refrescarComentariosEHistorial();
    } finally {
      setGuardandoComentario(false);
    }
  }

  async function subirAdjunto(archivo: File, descripcion: string) {
    try {
      setSubiendoAdjunto(true);

      await subirAdjuntoTicket(id, {
        archivo,
        descripcion,
      });

      await refrescarAdjuntosEHistorial();
    } finally {
      setSubiendoAdjunto(false);
    }
  }

  async function asignarTecnico(tecnicoId: number) {
    try {
      setAsignandoTicket(true);

      await asignarTicket(id, {
        tecnicoId,
      });

      await refrescarTicketEHistorial();
    } finally {
      setAsignandoTicket(false);
    }
  }

  async function reclasificar(
    impacto: string,
    urgencia: string,
    motivoReclasificacion: string
  ) {
    try {
      setReclasificandoTicket(true);

      await reclasificarTicket(id, {
        impacto,
        urgencia,
        motivoReclasificacion,
      });

      await refrescarTicketEHistorial();
    } finally {
      setReclasificandoTicket(false);
    }
  }

  async function resolver(solucion: string) {
    try {
      setCambiandoEstado(true);

      await resolverTicket(id, {
        solucion,
      });

      await refrescarTicketEHistorial();
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function cerrar(
    comentarioCierre: string,
    calificacionSatisfaccion?: number
  ) {
    try {
      setCambiandoEstado(true);

      await cerrarTicket(id, {
        comentarioCierre,
        calificacionSatisfaccion,
      });

      await refrescarTicketEHistorial();
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function reabrir(motivoReapertura: string) {
    try {
      setCambiandoEstado(true);

      await reabrirTicket(id, {
        motivoReapertura,
      });

      await refrescarTicketEHistorial();
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function cancelar(motivoCancelacion: string) {
    try {
      setCambiandoEstado(true);

      await cancelarTicket(id, {
        motivoCancelacion,
      });

      await refrescarTicketEHistorial();
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function escalar(motivoEscalamiento: string) {
    try {
      setCambiandoEstado(true);

      await escalarTicket(id, {
        motivoEscalamiento,
      });

      await refrescarTicketEHistorial();
    } finally {
      setCambiandoEstado(false);
    }
  }

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  return {
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
    reclasificandoTicket,
    error,

    agregarComentario,
    subirAdjunto,
    asignarTecnico,
    reclasificar,
    resolver,
    cerrar,
    reabrir,
    cancelar,
    escalar,
    recargarDetalle: cargarDetalle,
  };
}

async function resolverArregloSeguro<T>(
  callback: () => Promise<T[]>
): Promise<T[]> {
  try {
    return await callback();
  } catch {
    return [];
  }
}

function obtenerMensajeError(error: unknown, mensajePorDefecto: string) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError.response?.data;

  if (axiosError.response?.status === 403) {
    return "No tiene permisos para consultar este ticket.";
  }

  if (axiosError.response?.status === 404) {
    return "El ticket solicitado no fue encontrado.";
  }

  return data?.mensaje || data?.message || data?.title || mensajePorDefecto;
}