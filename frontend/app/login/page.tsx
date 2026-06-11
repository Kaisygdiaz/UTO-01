import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Sistema de Incidentes UTO
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Ingrese sus credenciales para continuar
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}