"use client";

import { Link } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { signUp } from "@/lib/actions/cuenta";
import { Spinner } from "@/components/ui/Spinner";

export function RegistroForm() {
  const t = useTranslations("auth");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await signUp({ nombre, apellido, email, password, consent });
      if (res.ok) setHecho(res.data.mensaje);
      else setError(res.error);
    });
  };

  if (hecho) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-gradient-accent text-2xl font-extrabold text-on-accent">
          ✓
        </div>
        <h3 className="m-0 mb-2.5 font-display text-[26px] uppercase">{t("revisaCorreo")}</h3>
        <p className="m-0 leading-[1.7] text-muted">{hecho}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("nombre")}</span>
          <input
            value={nombre}
            autoComplete="given-name"
            onChange={(e) => setNombre(e.target.value)}
            className="field !bg-bg"
          />
        </label>
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("apellido")}</span>
          <input
            value={apellido}
            autoComplete="family-name"
            onChange={(e) => setApellido(e.target.value)}
            className="field !bg-bg"
          />
        </label>
      </div>

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

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("contrasena")}</span>
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

      <button
        type="button"
        role="checkbox"
        aria-checked={consent}
        onClick={() => {
          setConsent((c) => !c);
          setError("");
        }}
        className="flex min-h-11 cursor-pointer items-start gap-3.5 rounded-2xl border border-hairline bg-bg p-[15px] text-left"
      >
        <span
          className="grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-hairline-strong text-[13px] font-extrabold text-on-accent"
          style={{ background: consent ? "var(--accent)" : "transparent" }}
        >
          {consent ? "✓" : ""}
        </span>
        <span className="text-sm leading-[1.6] text-muted">
          {t.rich("consentimiento", {
            aviso: (chunks) => (
              <Link
                href={{ pathname: "/contenido/[doc]", params: { doc: "privacidad" } }}
                className="text-accent underline underline-offset-4"
              >
                {chunks}
              </Link>
            ),
          })}
        </span>
      </button>

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
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? t("creando") : t("crearCuenta")}
      </button>
    </form>
  );
}
