export interface UsuarioSistema {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono: string | null;
  rolId: number;
  rol: string;
  activo: boolean;
  emailConfirmado: boolean;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}

export interface CrearUsuarioDto {
  nombreCompleto: string;
  correo: string;
  telefono: string | null;
  rolId: number;
}

export interface ActualizarUsuarioDto {
  nombreCompleto: string;
  telefono: string | null;
  rolId: number;
}

export interface CambiarEstadoUsuarioDto {
  activo: boolean;
}

export interface CambiarPasswordDto {
  passwordActual: string;
  nuevaPassword: string;
}

export interface ResetPasswordUsuarioDto {
  nuevaPassword: string;
}

export interface RolDisponible {
  id: number;
  nombre: string;
}

export interface SolicitarResetPasswordDto {
  correo: string;
}

export interface ConfirmarResetPasswordDto {
  token: string;
  nuevaPassword: string;
}