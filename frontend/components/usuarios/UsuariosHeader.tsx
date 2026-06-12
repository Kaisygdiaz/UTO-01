import { Users } from "lucide-react";

export default function UsuariosHeader() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Users className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Administración del sistema
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Usuarios
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Administre los usuarios del sistema, sus roles, estado de acceso y
            restablecimiento de contraseña.
          </p>
        </div>
      </div>
    </div>
  );
}