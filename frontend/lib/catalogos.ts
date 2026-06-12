import { api } from "./api";
import type { TecnicoCatalogo } from "@/types/catalogos";

function obtenerNumero(
  objeto: Record<string, unknown>,
  ...claves: string[]
): number {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "number") {
      return valor;
    }
  }

  return 0;
}

function obtenerTexto(
  objeto: Record<string, unknown>,
  ...claves: string[]
): string {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor;
    }
  }

  return "";
}

function mapearTecnico(item: Record<string, unknown>): TecnicoCatalogo {
  return {
    id: obtenerNumero(item, "Id", "id"),
    nombreCompleto: obtenerTexto(item, "NombreCompleto", "nombreCompleto"),
    correo: obtenerTexto(item, "Correo", "correo"),
  };
}

export async function obtenerTecnicos(): Promise<TecnicoCatalogo[]> {
  const response = await api.get<unknown>("/Catalogos/tecnicos");

  if (Array.isArray(response.data)) {
    return response.data.map((item) =>
      mapearTecnico(item as Record<string, unknown>)
    );
  }

  const data = response.data as Record<string, unknown>;

  if (Array.isArray(data.tecnicos)) {
    return data.tecnicos.map((item) =>
      mapearTecnico(item as Record<string, unknown>)
    );
  }

  return [];
}