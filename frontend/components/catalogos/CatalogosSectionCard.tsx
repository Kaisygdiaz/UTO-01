import type { ReactNode } from "react";

interface CatalogosSectionCardProps {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
  children: ReactNode;
}

export default function CatalogosSectionCard({
  titulo,
  descripcion,
  accion,
  children,
}: CatalogosSectionCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
          <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
        </div>

        {accion}
      </div>

      <div>{children}</div>
    </div>
  );
}