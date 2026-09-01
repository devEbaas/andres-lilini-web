"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

import { actualizarPassword } from "@/lib/actions/cuenta";
import { Spinner } from "@/components/ui/Spinner";

export function PasswordForm() {
  const err = useErrores();
  const t = useTranslations("account");
  const [password, setPassword] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState<ErrorRef | null>(null);
  const [hecho, setHecho] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== repetir) {
      setError("passwordNoCoinciden");
      return;
    }
    startTransition(async () => {
      const res = await actualizarPassword(password);
      if (res.ok) {
        setPassword("");
        setRepetir("");
        setHecho(true);
      } else {
        setError(res.code);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-[440px] gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("contrasenaNueva")}</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field !bg-bg"
        />
        <span className="font-mono text-[10px] leading-[1.7] text-muted">
          {t("reglaContrasena")}
        </span>
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("repitela")}</span>
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
          {err(error)}
        </div>
      )}
      {hecho && <p className="m-0 text-sm text-accent">{t("contrasenaActualizada")}</p>}

      <button
        type="submit"
        disabled={pending || !password}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? t("guardando") : t("cambiarContrasena")}
      </button>
    </form>
  );
}
