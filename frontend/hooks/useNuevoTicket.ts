"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  impactosDisponibles,
  obtenerCategorias,
  urgenciasDisponibles,
} from "@/lib/catalogos";
import { crearTicket, subirAdjuntoTicket } from "@/lib/tickets";
import type { CategoriaCatalogo } from "@/types/catalogos";

export function useNuevoTicket() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [impacto, setImpacto] = useState("");
  const [urgencia, setUrgencia] = useState("");

  const [archivo, setArchivo] = useState<File | null>(null);
  const [descripcionAdjunto, setDescripcionAdjunto] = useState("");

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        setError("");
        setCargandoCatalogos(true);

        const categoriasData = await obtenerCategorias();
        setCategorias(categoriasData);
      } catch {
        setError("No fue posible cargar las categorías disponibles.");
      } finally {
        setCargandoCatalogos(false);
      }
    }

    cargarCatalogos();
  }, []);

  function quitarArchivo() {
    setArchivo(null);
    setDescripcionAdjunto("");
  }

  async function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setMensajeExito("");

      if (!titulo.trim()) {
        setError("Debe ingresar el título del ticket.");
        return;
      }

      if (titulo.trim().length < 5) {
        setError("El título debe tener al menos 5 caracteres.");
        return;
      }

      if (!descripcion.trim()) {
        setError("Debe ingresar la descripción del incidente o solicitud.");
        return;
      }

      if (descripcion.trim().length < 15) {
        setError("La descripción debe tener al menos 15 caracteres.");
        return;
      }

      if (!categoriaId) {
        setError("Debe seleccionar una categoría.");
        return;
      }

      if (!impacto) {
        setError("Debe seleccionar el impacto.");
        return;
      }

      if (!urgencia) {
        setError("Debe seleccionar la urgencia.");
        return;
      }

      setGuardando(true);

      const ticketCreado = await crearTicket({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoriaId: Number(categoriaId),
        impacto,
        urgencia,
      });

      if (archivo) {
        try {
          await subirAdjuntoTicket(ticketCreado.id, {
            archivo,
            descripcion:
              descripcionAdjunto.trim() ||
              "Evidencia adjunta al momento de crear el ticket.",
          });

          setMensajeExito(
            "Ticket creado correctamente. El adjunto también fue cargado."
          );
        } catch {
          setMensajeExito(
            "Ticket creado correctamente, pero no fue posible subir el adjunto. Podrá agregarlo desde el detalle del ticket."
          );
        }
      } else {
        setMensajeExito("Ticket creado correctamente.");
      }

      setTimeout(() => {
        router.push(`/tickets/${ticketCreado.id}`);
      }, 900);
    } catch {
      setError(
        "No fue posible crear el ticket. Verifique los datos e intente nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  }

  return {
    categorias,
    impactosDisponibles,
    urgenciasDisponibles,
    cargandoCatalogos,
    guardando,
    error,
    mensajeExito,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    categoriaId,
    setCategoriaId,
    impacto,
    setImpacto,
    urgencia,
    setUrgencia,
    archivo,
    setArchivo,
    descripcionAdjunto,
    setDescripcionAdjunto,
    quitarArchivo,
    enviarFormulario,
  };
}

export type UseNuevoTicketReturn = ReturnType<typeof useNuevoTicket>;