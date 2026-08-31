"use client";

import { useState, useTransition } from "react";

import { actualizarPassword } from "@/lib/actions/cuenta";
import { Spinner } from "@/components/ui/Spinner";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== repetir) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      const res = await actualizarPassword(password);
      if (res.ok) {
        setPassword("");
        setRepetir("");
        setHecho(true);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-[440px] gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Contraseña nueva</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field !bg-bg"
        />
        <span className="font-mono text-[10px] leading-[1.7] text-muted">
          Mínimo 12 caracteres, con mayúsculas, minúsculas y números.
        </span>
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Repítela</span>
        <input
          type="password"
          autoComplete="new-password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
          className="field !bg-bg"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {error}
        </div>
      )}
      {hecho && <p className="m-0 text-sm text-accent">Contraseña actualizada.</p>}

      <button
        type="submit"
        disabled={pending || !password}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Guardando" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
