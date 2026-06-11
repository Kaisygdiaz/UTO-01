import type { UsuarioAutenticado } from "@/types/auth";
import Card from "@/components/ui/Card";

interface SessionInfoProps {
  usuario: UsuarioAutenticado | null;
}

export default function SessionInfo({ usuario }: SessionInfoProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-slate-900">
        Información de sesión
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Usuario</p>
          <p className="font-semibold text-slate-900 mt-1">
            {usuario?.nombreCompleto}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Correo</p>
          <p className="font-semibold text-slate-900 mt-1">
            {usuario?.correo}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Rol</p>
          <p className="font-semibold text-slate-900 mt-1">{usuario?.rol}</p>
        </div>
      </div>
    </Card>
  );
}