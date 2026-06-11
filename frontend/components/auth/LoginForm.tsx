"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { login } from "@/lib/auth";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";

export default function LoginForm() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
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

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Ingrese su contraseña"
      />

      <ErrorMessage mensaje={error} />

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}