"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { activarCuenta } from "@/lib/usuarios";

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
    "No se pudo activar la cuenta. Verifica que el enlace sea válido."
  );
}

export function useActivarCuenta() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const formularioBloqueado = cargando || Boolean(exito);

  function limpiarMensajes() {
    setError("");
    setExito("");
  }

  function validarFormulario() {
    if (!token) {
      return "El enlace de activación no es válido o no contiene token.";
    }

    if (!nuevaPassword.trim() || !confirmarPassword.trim()) {
      return "Debe ingresar y confirmar la nueva contraseña.";
    }

    if (nuevaPassword.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (nuevaPassword !== confirmarPassword) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  }

  async function manejarActivacion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    limpiarMensajes();

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    try {
      setCargando(true);

      const respuesta = await activarCuenta(token, nuevaPassword);

      setExito(
        respuesta?.mensaje ||
          "Cuenta activada correctamente. Ya puedes iniciar sesión."
      );

      setNuevaPassword("");
      setConfirmarPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 2200);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  function volverLogin() {
    router.push("/login");
  }

  return {
    token,
    nuevaPassword,
    confirmarPassword,
    mostrarNuevaPassword,
    mostrarConfirmacion,
    cargando,
    error,
    exito,
    formularioBloqueado,

    setNuevaPassword,
    setConfirmarPassword,
    setMostrarNuevaPassword,
    setMostrarConfirmacion,
    manejarActivacion,
    volverLogin,
  };
}