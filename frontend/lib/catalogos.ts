import { api } from "./api";
import type { CategoriaCatalogo, TecnicoCatalogo } from "@/types/catalogos";

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

function mapearCategoria(item: Record<string, unknown>): CategoriaCatalogo {
  return {
    id: obtenerNumero(item, "Id", "id"),
    nombre: obtenerTexto(item, "Nombre", "nombre"),
    descripcion: obtenerTexto(item, "Descripcion", "descripcion"),
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

export async function obtenerCategorias(): Promise<CategoriaCatalogo[]> {
  const response = await api.get<unknown>("/Catalogos/categorias");

  if (Array.isArray(response.data)) {
    return response.data.map((item) =>
      mapearCategoria(item as Record<string, unknown>)
    );
  }

  const data = response.data as Record<string, unknown>;

  if (Array.isArray(data.categorias)) {
    return data.categorias.map((item) =>
      mapearCategoria(item as Record<string, unknown>)
    );
  }

  return [];
}

export const impactosDisponibles = ["Bajo", "Medio", "Alto"];

export const urgenciasDisponibles = ["Baja", "Media", "Alta"];