"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

import { signIn } from "@/lib/actions/auth";
import { verificarMfa } from "@/lib/actions/mfa";
import { Spinner } from "@/components/ui/Spinner";

const inputCodigo =
  "field !bg-bg text-center font-mono !text-[22px] tracking-[0.5em]";

export function LoginForm({ next }: { next?: string }) {
  const err = useErrores();
  // Las acciones no pueden leer el idioma del segmento: se lo damos nosotros
  // para que el destino por defecto caiga en la versión correcta del sitio.
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pideCodigo, setPideCodigo] = useState(false);
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const onCredenciales = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // En caso de éxito la acción redirige desde el servidor y esto no
      // vuelve: sólo se llega aquí si falta el segundo factor o si algo
      // falló.
      const res = await signIn({ email, password, next, locale });
      if (!res.ok) {
        setError(res.code);
        return;
      }
      setPassword(""); // No se queda en memoria mientras se pide el código.
      setPideCodigo(true);
    });
  };

  const onCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // Sólo vuelve si el código no valía: al verificar, la acción redirige.
      const res = await verificarMfa({ code: codigo, next, locale });
      setCodigo("");
      setError(res.code);
    });
  };

  const aviso = error && (
    <div
      role="alert"
      className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
    >
      {err(error)}
    </div>
  );

  if (pideCodigo) {
    return (
      <form onSubmit={onCodigo} noValidate className="grid gap-[18px]">
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("codigo")}</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder={t("codigoPh")}
            className={inputCodigo}
          />
        </label>

        <p className="m-0 text-xs leading-[1.7] text-muted">
          {t("codigoAyuda")}
        </p>

        {aviso}

        <button
          type="submit"
          disabled={pending || codigo.length < 6}
          className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
        >
          {pending && <Spinner />}
          {pending ? t("verificando") : t("verificar")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCredenciales} noValidate className="grid gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("correo")}</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("correoPh")}
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("contrasena")}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("contrasenaPh")}
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
        {pending ? t("entrando") : t("entrar")}
      </button>
    </form>
  );
}
