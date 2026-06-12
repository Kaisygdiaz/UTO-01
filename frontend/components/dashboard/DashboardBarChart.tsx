import Card from "@/components/ui/Card";

interface DashboardBarChartItem {
  label: string;
  total: number;
}

interface DashboardBarChartProps {
  titulo: string;
  descripcion: string;
  items: DashboardBarChartItem[];
}

const colores = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-purple-600",
  "bg-red-600",
  "bg-slate-600",
];

export default function DashboardBarChart({
  titulo,
  descripcion,
  items,
}: DashboardBarChartProps) {
  const maximo = Math.max(...items.map((item) => item.total), 1);

  return (
    <Card className="p-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No hay datos para mostrar.</p>
        ) : (
          items.map((item, index) => {
            const porcentaje = (item.total / maximo) * 100;

            return (
              <div key={`${item.label}-${index}`}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">
                    {item.label}
                  </p>

                  <span className="text-sm font-bold text-slate-900">
                    {item.total}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      colores[index % colores.length]
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}