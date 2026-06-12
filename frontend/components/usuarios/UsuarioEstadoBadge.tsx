interface UsuarioEstadoBadgeProps {
  activo: boolean;
}

export default function UsuarioEstadoBadge({ activo }: UsuarioEstadoBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        activo
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}