import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

interface DashboardCardProps {
  titulo: string;
  valor: number | string;
  descripcion: string;
  icono: LucideIcon;
  iconColor: string;
}

export default function DashboardCard({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  iconColor,
}: DashboardCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">{valor}</p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {descripcion}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-2">
          <Icono className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}