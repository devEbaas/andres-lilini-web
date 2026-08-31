"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { signIn } from "@/lib/actions/auth";
import { verificarMfa } from "@/lib/actions/mfa";
import { Spinner } from "@/components/ui/Spinner";

const inputCodigo =
  "field !bg-bg text-center font-mono !text-[22px] tracking-[0.5em]";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pideCodigo, setPideCodigo] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const entrar = (destino: string) => {
    // `refresh()` antes de navegar: los Server Components tienen que volver a
    // renderizarse ya con la sesión puesta en las cookies.
    router.refresh();
    router.replace(destino);
  };

  const onCredenciales = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await signIn({ email, password, next });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if ("mfa" in res.data) {
        setPassword(""); // No se queda en memoria mientras se pide el código.
        setPideCodigo(true);
        return;
      }
      entrar(res.data.redirectTo);
    });
  };

  const onCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await verificarMfa({ code: codigo, next });
      if (!res.ok) {
        setCodigo("");
        setError(res.error);
        return;
      }
      entrar(res.data.redirectTo);
    });
  };

  const aviso = error && (
    <div
      role="alert"
      className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
    >
      {error}
    </div>
  );

  if (pideCodigo) {
    return (
      <form onSubmit={onCodigo} noValidate className="grid gap-[18px]">
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">Código de verificación</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className={inputCodigo}
          />
        </label>

        <p className="m-0 text-xs leading-[1.7] text-muted">
          Abre tu aplicación de autenticación y escribe el código de seis dígitos.
        </p>

        {aviso}

        <button
          type="submit"
          disabled={pending || codigo.length < 6}
          className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
        >
          {pending && <Spinner />}
          {pending ? "Verificando" : "Verificar"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCredenciales} noValidate className="grid gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Correo</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="field !bg-bg"
        />
      </label>

      {aviso}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Entrando" : "Entrar"}
      </button>
    </form>
  );
}
