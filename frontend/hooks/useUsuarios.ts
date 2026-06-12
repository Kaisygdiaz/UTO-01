"use client";

import { useCallback, useEffect, useState } from "react";
import type { AxiosError } from "axios";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  obtenerUsuarios,
  reenviarActivacionCuenta,
  solicitarResetPassword,
} from "@/lib/usuarios";
import type {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  UsuarioSistema,
} from "@/types/usuarios";

type CrearUsuarioFormularioDto = CrearUsuarioDto;

type ApiErrorResponse = {
  mensaje?: string;
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

type ApiSuccessResponse = {
  mensaje?: string;
  message?: string;
};

function obtenerMensajeError(error: unknown, mensajePorDefecto: string) {
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
    mensajePorDefecto
  );
}

function obtenerMensajeExito(data: unknown, mensajePorDefecto: string) {
  if (!data || typeof data !== "object") {
    return mensajePorDefecto;
  }

  const respuesta = data as ApiSuccessResponse;

  return respuesta.mensaje || respuesta.message || mensajePorDefecto;
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const cargarUsuarios = useCallback(async (mostrarCarga = false) => {
    try {
      if (mostrarCarga) {
        setCargando(true);
      }

      setError("");

      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible cargar los usuarios del sistema."
        )
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios(true);
  }, [cargarUsuarios]);

  function limpiarMensajes() {
    setError("");
    setMensajeExito("");
  }

  async function guardarUsuario(
    id: number | null,
    dto: CrearUsuarioFormularioDto | ActualizarUsuarioDto
  ) {
    try {
      setGuardando(true);
      limpiarMensajes();

      if (id) {
        const respuesta = await actualizarUsuario(
          id,
          dto as ActualizarUsuarioDto
        );

        setMensajeExito(
          obtenerMensajeExito(respuesta, "Usuario actualizado correctamente.")
        );
      } else {
        const usuarioNuevo = dto as CrearUsuarioFormularioDto;

        const respuesta = await crearUsuario(usuarioNuevo);

        setMensajeExito(
          obtenerMensajeExito(
            respuesta,
            `Usuario creado correctamente. Se envió un correo de activación al correo ${usuarioNuevo.correo}.`
          )
        );
      }

      await cargarUsuarios(false);
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No fue posible guardar el usuario.")
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarActivoUsuario(usuario: UsuarioSistema) {
    try {
      setGuardando(true);
      limpiarMensajes();

      const respuesta = await cambiarEstadoUsuario(usuario.id, !usuario.activo);

      setMensajeExito(
        obtenerMensajeExito(
          respuesta,
          usuario.activo
            ? "Usuario inactivado correctamente."
            : "Usuario activado correctamente."
        )
      );

      await cargarUsuarios(false);
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible cambiar el estado del usuario."
        )
      );
    } finally {
      setGuardando(false);
    }
  }

  async function enviarResetPasswordUsuario(usuario: UsuarioSistema) {
    try {
      setGuardando(true);
      limpiarMensajes();

      const respuesta = await solicitarResetPassword(usuario.correo);

      setMensajeExito(
        obtenerMensajeExito(
          respuesta,
          `Se envió el correo de restablecimiento de contraseña a ${usuario.correo}.`
        )
      );
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible enviar el correo de restablecimiento."
        )
      );
    } finally {
      setGuardando(false);
    }
  }

  async function reenviarActivacionUsuario(usuario: UsuarioSistema) {
    try {
      setGuardando(true);
      limpiarMensajes();

      const respuesta = await reenviarActivacionCuenta(usuario.correo);

      setMensajeExito(
        obtenerMensajeExito(
          respuesta,
          `Se reenvió el correo de activación a ${usuario.correo}.`
        )
      );

      await cargarUsuarios(false);
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible reenviar el correo de activación."
        )
      );
    } finally {
      setGuardando(false);
    }
  }

  return {
    usuarios,
    cargando,
    guardando,
    error,
    mensajeExito,

    cargarUsuarios: () => cargarUsuarios(false),
    limpiarMensajes,
    guardarUsuario,
    cambiarActivoUsuario,
    enviarResetPasswordUsuario,
    reenviarActivacionUsuario,
  };
}