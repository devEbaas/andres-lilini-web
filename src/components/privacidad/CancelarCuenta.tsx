"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { cancelarMiCuenta } from "@/lib/actions/privacidad";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";

export function CancelarCuenta({ email }: { email: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await cancelarMiCuenta({ password, confirmacion });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      router.replace({ pathname: "/", query: { baja: "1" } });
    });
  };

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className={btnQuiet}>
        {t("cancelarBoton")}
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-[18px] rounded-[18px] border border-danger/40 bg-danger/5 p-5"
    >
      <p className="m-0 text-sm leading-[1.7] text-muted">
        {t.rich("cancelarAviso", {
          email,
          correo: (chunks) => <strong className="text-ink">{chunks}</strong>,
        })}
      </p>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("tuCorreo")}</span>
        <input
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          autoComplete="off"
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("passwordTitulo")}</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={pending || !password || !confirmacion}
          className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full border border-danger/60 bg-transparent text-xs font-extrabold uppercase tracking-[0.18em] text-danger-text disabled:opacity-50"
        >
          {pending && <Spinner />}
          {pending ? t("cancelando") : t("cancelarDefinitivo")}
        </button>
        <button
          type="button"
          onClick={() => {
            setAbierto(false);
            setPassword("");
            setConfirmacion("");
            setError("");
          }}
          className={btnQuiet}
        >
          {t("mejorNo")}
        </button>
      </div>
    </form>
  );
}
