"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { verificarMfa } from "@/lib/actions/mfa";
import { Spinner } from "@/components/ui/Spinner";

/** Reto suelto: para la sesión que se quedó a medias y vuelve más tarde. */
export function MfaChallengeForm({ next }: { next?: string }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await verificarMfa({ code: codigo, next });
      if (!res.ok) {
        setCodigo("");
        setError(res.error);
        return;
      }
      router.refresh();
      router.replace(res.data.redirectTo);
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
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
          className="field !bg-bg text-center font-mono !text-[22px] tracking-[0.5em]"
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
