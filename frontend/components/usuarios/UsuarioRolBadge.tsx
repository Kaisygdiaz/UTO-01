interface UsuarioRolBadgeProps {
  rol: string;
}

export default function UsuarioRolBadge({ rol }: UsuarioRolBadgeProps) {
  const estilo = obtenerEstiloRol(rol);

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${estilo}`}>
      {rol}
    </span>
  );
}

function obtenerEstiloRol(rol: string) {
  const texto = rol.toLowerCase();

  if (texto.includes("administrador")) {
    return "bg-purple-50 text-purple-700";
  }

  if (texto.includes("jefe")) {
    return "bg-blue-50 text-blue-700";
  }

  if (texto.includes("técnico") || texto.includes("tecnico")) {
    return "bg-amber-50 text-amber-700";
  }

  if (texto.includes("solicitante")) {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-slate-100 text-slate-700";
}