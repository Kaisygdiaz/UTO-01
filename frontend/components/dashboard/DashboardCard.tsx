import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

interface DashboardCardProps {
  titulo: string;
  valor: number;
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
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{titulo}</p>
        <Icono className={`h-5 w-5 ${iconColor}`} />
      </div>

      <p className="text-3xl font-bold text-slate-900 mt-4">{valor}</p>

      <p className="text-xs text-slate-400 mt-1">{descripcion}</p>
    </Card>
  );
}