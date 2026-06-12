import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function TicketsHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Mesa de ayuda
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Gestión de tickets
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Administre, consulte y dé seguimiento a los incidentes tecnológicos
          registrados en la unidad.
        </p>
      </div>

      <Button className="inline-flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nuevo ticket
      </Button>
    </div>
  );
}