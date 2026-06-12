import { Suspense } from "react";
import ActivarCuentaForm from "@/components/auth/ActivarCuentaForm";

function ActivarCuentaLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">Cargando activación...</p>
    </main>
  );
}

export default function ActivarCuentaPage() {
  return (
    <Suspense fallback={<ActivarCuentaLoading />}>
      <ActivarCuentaForm />
    </Suspense>
  );
}