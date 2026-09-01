"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

import { exportarMisDatos } from "@/lib/actions/privacidad";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";

/** Derecho de acceso, en autoservicio: perfil y pedidos en un JSON. */
export function MisDatos() {
  const err = useErrores();
  const t = useTranslations("account");
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const descargar = () => {
    setError(null);
    startTransition(async () => {
      const res = await exportarMisDatos();
      if (!res.ok) {
        setError(res.code);
        return;
      }
      const url = URL.createObjectURL(
        new Blob([res.data.json], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="grid gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {err(error)}
        </div>
      )}
      <button type="button" onClick={descargar} disabled={pending} className={btnQuiet}>
        {pending && <Spinner />}
        {pending ? t("descargando") : t("descargar")}
      </button>
    </div>
  );
}
