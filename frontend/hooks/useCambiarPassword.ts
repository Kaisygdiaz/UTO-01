"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { cambiarPassword } from "@/lib/usuarios";

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
    "No fue posible cambiar la contraseña."
  );
}

export function useCambiarPassword() {
  const router = useRouter();

  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const formularioBloqueado = guardando || Boolean(mensajeExito);

  function limpiarMensajes() {
    setError("");
    setMensajeExito("");
  }

  function validarFormulario() {
    if (
      !passwordActual.trim() ||
      !nuevaPassword.trim() ||
      !confirmarPassword.trim()
    ) {
      return "Debe completar todos los campos.";
    }

    if (nuevaPassword.length < 6) {
      return "La nueva contraseña debe tener al menos 6 caracteres.";
    }

    if (passwordActual === nuevaPassword) {
      return "La nueva contraseña no puede ser igual a la contraseña actual.";
    }

    if (nuevaPassword !== confirmarPassword) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  }

  async function manejarCambioPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    limpiarMensajes();

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await cambiarPassword({
        passwordActual,
        nuevaPassword,
      });

      setMensajeExito(
        respuesta?.mensaje || "Contraseña actualizada correctamente."
      );

      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  }

  function volver() {
    router.back();
  }

  return {
    passwordActual,
    nuevaPassword,
    confirmarPassword,

    mostrarActual,
    mostrarNueva,
    mostrarConfirmacion,

    guardando,
    error,
    mensajeExito,
    formularioBloqueado,

    setPasswordActual,
    setNuevaPassword,
    setConfirmarPassword,

    setMostrarActual,
    setMostrarNueva,
    setMostrarConfirmacion,

    manejarCambioPassword,
    volver,
  };
}