import { api } from "./api";
import type { LoginRequest, LoginResponse, UsuarioAutenticado } from "@/types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "usuario";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/Auth/login", data);

  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario));

  return response.data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario(): UsuarioAutenticado | null {
  if (typeof window === "undefined") return null;

  const usuario = localStorage.getItem(USER_KEY);

  if (!usuario) return null;

  try {
    return JSON.parse(usuario) as UsuarioAutenticado;
  } catch {
    return null;
  }
}

export function estaAutenticado(): boolean {
  return getToken() !== null;
}