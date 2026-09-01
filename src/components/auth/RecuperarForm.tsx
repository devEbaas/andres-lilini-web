"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AvisoKey } from "@/lib/actions/types";
import { useAvisos } from "@/lib/errores";

import { solicitarReset } from "@/lib/actions/cuenta";
import { Spinner } from "@/components/ui/Spinner";

export function RecuperarForm() {
  const t = useTranslations("auth");
  const aviso = useAvisos();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [hecho, setHecho] = useState<AvisoKey | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // El idioma decide a qué versión de /cuenta/password vuelve el enlace.
      const res = await solicitarReset(email, locale);
      // Siempre ok: la respuesta no cambia según exista o no la cuenta.
      if (res.ok) setHecho(res.data.mensaje);
    });
  };

  if (hecho) {
    return <p className="m-0 leading-[1.7] text-muted">{aviso(hecho)}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("correo")}</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("correoPh")}
          className="field !bg-bg"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? t("enviando") : t("enviarEnlace")}
      </button>
    </form>
  );
}
