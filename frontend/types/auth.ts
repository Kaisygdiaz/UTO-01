export interface LoginRequest {
  correo: string;
  password: string;
}

export interface UsuarioAutenticado {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  expiracion: string;
  usuario: UsuarioAutenticado;
}