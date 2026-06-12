"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { solicitarResetPassword } from "@/lib/usuarios";

type ApiErrorResponse = {
  mensaje?: string;
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

function obtenerMensajeError(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError.response?.data;

  const primerError = data?.errors
    ? Object.values(data.errors).flat()[0]
    : null;

  return (
    data?.mensaje ||
    data?.message ||
    primerError ||
    data?.title ||
    "No fue posible enviar el correo de restablecimiento."
  );
}

export function useForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const formularioBloqueado = cargando || Boolean(mensajeExito);

  function limpiarMensajes() {
    setError("");
    setMensajeExito("");
  }

  function validarFormulario() {
    if (!correo.trim()) {
      return "Debe ingresar su correo electrónico.";
    }

    if (!correo.includes("@")) {
      return "Ingrese un correo electrónico válido.";
    }

    return "";
  }

  async function manejarSolicitud(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    limpiarMensajes();

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    try {
      setCargando(true);

      const respuesta = await solicitarResetPassword(correo.trim());

      setMensajeExito(
        respuesta?.mensaje ||
          "Si el correo existe y está activo, se enviará un enlace de restablecimiento."
      );

      setCorreo("");
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return {
    correo,
    cargando,
    error,
    mensajeExito,
    formularioBloqueado,

    setCorreo,
    manejarSolicitud,
  };
}