import { api } from "./api";
import type {
  ActualizarUsuarioDto,
  CambiarEstadoUsuarioDto,
  CambiarPasswordDto,
  CrearUsuarioDto,
  RolDisponible,
  UsuarioSistema,
} from "@/types/usuarios";

export const rolesDisponibles: RolDisponible[] = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Jefe DTI" },
  { id: 3, nombre: "Técnico" },
  { id: 4, nombre: "Solicitante" },
];

export async function obtenerPerfilUsuario() {
  const response = await api.get<unknown>("/Usuarios/perfil");
  return mapearUsuario(response.data);
}

export async function obtenerUsuarios() {
  const response = await api.get<unknown>("/Usuarios");
  const lista = extraerListaUsuarios(response.data);

  return lista.map(mapearUsuario);
}

export async function crearUsuario(dto: CrearUsuarioDto) {
  const response = await api.post("/Usuarios", dto);
  return response.data;
}

export async function actualizarUsuario(id: number, dto: ActualizarUsuarioDto) {
  const response = await api.put(`/Usuarios/${id}`, dto);
  return response.data;
}

export async function cambiarEstadoUsuario(id: number, activo: boolean) {
  const dto: CambiarEstadoUsuarioDto = { activo };
  const response = await api.put(`/Usuarios/${id}/estado`, dto);

  return response.data;
}

export async function cambiarPassword(dto: CambiarPasswordDto) {
  const response = await api.put("/Usuarios/cambiar-password", dto);
  return response.data;
}

export async function solicitarResetPassword(correo: string) {
  const response = await api.post("/Auth/solicitar-reset-password", {
    correo,
  });

  return response.data;
}

export async function reenviarActivacionCuenta(correo: string) {
  const response = await api.post("/Auth/reenviar-confirmacion", {
    correo,
  });

  return response.data;
}

export async function confirmarResetPassword(
  token: string,
  nuevaPassword: string
) {
  const response = await api.post("/Auth/confirmar-reset-password", {
    token,
    nuevaPassword,
  });

  return response.data;
}

export async function confirmarEmail(token: string) {
  const tokenLimpio = token.replaceAll(" ", "+");

  const response = await api.get("/Auth/confirmar-email", {
    params: {
      token: tokenLimpio,
    },
  });

  return response.data;
}

export async function activarCuenta(token: string, nuevaPassword: string) {
  const response = await api.post("/Auth/activar-cuenta", {
    token,
    nuevaPassword,
  });

  return response.data;
}

function extraerListaUsuarios(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const objeto = data as Record<string, unknown>;

  const posiblesClaves = [
    "usuarios",
    "Usuarios",
    "registros",
    "Registros",
    "items",
    "Items",
    "data",
    "Data",
    "resultado",
    "Resultado",
    "resultados",
    "Resultados",
    "$values",
  ];

  for (const clave of posiblesClaves) {
    const valor = objeto[clave];

    if (Array.isArray(valor)) {
      return valor;
    }

    if (valor && typeof valor === "object") {
      const valorObjeto = valor as Record<string, unknown>;

      if (Array.isArray(valorObjeto["$values"])) {
        return valorObjeto["$values"] as unknown[];
      }
    }
  }

  return [];
}

function mapearUsuario(item: unknown): UsuarioSistema {
  const usuario = item as Record<string, unknown>;
  const rolId = obtenerRolId(usuario);

  return {
    id: obtenerNumero(usuario, "id", "Id"),
    nombreCompleto: obtenerTexto(
      usuario,
      "nombreCompleto",
      "NombreCompleto",
      "nombre",
      "Nombre"
    ),
    correo: obtenerTexto(usuario, "correo", "Correo", "email", "Email"),
    telefono: obtenerTextoONull(usuario, "telefono", "Telefono"),
    rolId,
    rol: obtenerRol(usuario, rolId),
    activo: obtenerBooleano(usuario, "activo", "Activo"),
    emailConfirmado: obtenerBooleano(
      usuario,
      "emailConfirmado",
      "EmailConfirmado",
      "correoConfirmado",
      "CorreoConfirmado"
    ),
    fechaCreacion: obtenerTextoONull(usuario, "fechaCreacion", "FechaCreacion"),
    fechaActualizacion: obtenerTextoONull(
      usuario,
      "fechaActualizacion",
      "FechaActualizacion"
    ),
  };
}

function obtenerRol(usuario: Record<string, unknown>, rolId: number) {
  const rolTexto = obtenerTexto(
    usuario,
    "rol",
    "Rol",
    "nombreRol",
    "NombreRol",
    "rolNombre",
    "RolNombre"
  );

  if (rolTexto) {
    return rolTexto;
  }

  const rolObjeto = usuario["rol"] ?? usuario["Rol"];

  if (rolObjeto && typeof rolObjeto === "object") {
    const rol = rolObjeto as Record<string, unknown>;

    const nombreRol = obtenerTexto(
      rol,
      "nombre",
      "Nombre",
      "descripcion",
      "Descripcion"
    );

    if (nombreRol) {
      return nombreRol;
    }
  }

  const rolEncontrado = rolesDisponibles.find((rol) => rol.id === rolId);

  return rolEncontrado?.nombre ?? "Sin rol";
}

function obtenerRolId(usuario: Record<string, unknown>) {
  const rolIdDirecto = obtenerNumero(usuario, "rolId", "RolId");

  if (rolIdDirecto > 0) {
    return rolIdDirecto;
  }

  const rolObjeto = usuario["rol"] ?? usuario["Rol"];

  if (rolObjeto && typeof rolObjeto === "object") {
    const rol = rolObjeto as Record<string, unknown>;
    const rolId = obtenerNumero(rol, "id", "Id");

    if (rolId > 0) {
      return rolId;
    }
  }

  const rolTexto = obtenerTexto(
    usuario,
    "rol",
    "Rol",
    "nombreRol",
    "NombreRol",
    "rolNombre",
    "RolNombre"
  );

  const rolEncontrado = rolesDisponibles.find(
    (rol) => rol.nombre.toLowerCase() === rolTexto.toLowerCase()
  );

  return rolEncontrado?.id ?? 0;
}

function obtenerNumero(objeto: Record<string, unknown>, ...claves: string[]) {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "number") {
      return valor;
    }

    if (typeof valor === "string" && !Number.isNaN(Number(valor))) {
      return Number(valor);
    }
  }

  return 0;
}

function obtenerTexto(objeto: Record<string, unknown>, ...claves: string[]) {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "string") {
      return valor;
    }

    if (typeof valor === "number") {
      return String(valor);
    }
  }

  return "";
}

function obtenerTextoONull(
  objeto: Record<string, unknown>,
  ...claves: string[]
) {
  const valor = obtenerTexto(objeto, ...claves);

  return valor.trim() ? valor : null;
}

function obtenerBooleano(objeto: Record<string, unknown>, ...claves: string[]) {
  for (const clave of claves) {
    const valor = objeto[clave];

    if (typeof valor === "boolean") {
      return valor;
    }

    if (typeof valor === "string") {
      return valor.toLowerCase() === "true";
    }
  }

  return false;
}

