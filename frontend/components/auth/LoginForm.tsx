"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";

export default function LoginForm() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login({ correo, password });
      router.push("/dashboard");
    } catch (err) {
      const errorAxios = err as AxiosError<{ mensaje?: string }>;

      setError(
        errorAxios.response?.data?.mensaje ||
          "No fue posible iniciar sesión. Verifique sus credenciales."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={manejarLogin} className="space-y-5">
      <Input
        label="Correo electrónico"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        placeholder="usuario@correo.com"
      />

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Contraseña
        </label>

        <div className="relative">
          <input
            type={mostrarPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Ingrese su contraseña"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setMostrarPassword((actual) => !actual)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label={
              mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {mostrarPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>
      </div>

      <ErrorMessage mensaje={error} />

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}