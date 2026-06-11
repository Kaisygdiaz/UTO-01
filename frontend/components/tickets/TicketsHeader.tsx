import Button from "@/components/ui/Button";

export default function TicketsHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
        <p className="text-slate-500 mt-1">
          Listado general de incidentes tecnológicos registrados en el sistema.
        </p>
      </div>

      <Button>Nuevo ticket</Button>
    </div>
  );
}