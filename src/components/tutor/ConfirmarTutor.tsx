"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { confirmarTutor } from "@/lib/actions/tutor";
import { Spinner } from "@/components/ui/Spinner";

export function ConfirmarTutor({ token }: { token: string }) {
  const t = useTranslations("tutor");
  const [hecho, setHecho] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (hecho) {
    return (
      <div className="rounded-[22px] border border-accent/40 bg-panel-2 p-6 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-gradient-accent text-xl font-extrabold text-on-accent">
          ✓
        </div>
        <p className="m-0 leading-[1.7] text-muted">
          {t("registrada")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await confirmarTutor(token);
            if (res.ok) setHecho(true);
            else setError(res.error);
          })
        }
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? t("registrando") : t("autorizar")}
      </button>
      {error && (
        <p
          role="alert"
          className="m-0 rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {error}
        </p>
      )}
    </div>
  );
}
