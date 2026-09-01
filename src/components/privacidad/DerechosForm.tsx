"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AvisoKey, ErrorRef } from "@/lib/actions/types";
import { useAvisos, useErrores } from "@/lib/errores";

import { crearSolicitudArco } from "@/lib/actions/privacidad";
import { Spinner } from "@/components/ui/Spinner";

// Los valores están fijados por el CHECK de `arco_solicitudes.tipo`: se
// guardan tal cual y sólo el rótulo se traduce, desde `derechos.tipos`.
const DERECHOS = ["acceso", "rectificacion", "cancelacion", "oposicion"] as const;

export function DerechosForm() {
  const err = useErrores();
  const aviso = useAvisos();
  const t = useTranslations("derechos");
  const locale = useLocale();
  const [tipo, setTipo] = useState("acceso");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState<ErrorRef | null>(null);
  const [hecho, setHecho] = useState<AvisoKey | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearSolicitudArco({ tipo, nombre, email, detalle, locale });
      if (res.ok) setHecho(res.data.mensaje);
      else setError(res.code);
    });
  };

  if (hecho) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-gradient-accent text-2xl font-extrabold text-on-accent">
          ✓
        </div>
        <h3 className="m-0 mb-2.5 font-display text-[26px] uppercase">{t("recibida")}</h3>
        <p className="m-0 leading-[1.7] text-muted">{aviso(hecho)}</p>
      </div>
    );
  }


  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <div className="grid gap-[9px]">
        <span className="label-caps">{t("queEjercer")}</span>
        <div className="flex flex-wrap gap-2">
          {DERECHOS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setTipo(d)}
              aria-pressed={tipo === d}
              className={`min-h-11 cursor-pointer rounded-full border px-[18px] text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
                tipo === d
                  ? "border-accent bg-panel-2 text-ink"
                  : "border-hairline bg-transparent text-muted hover:text-ink"
              }`}
            >
              {t(`tipos.${d}.n`)}
            </button>
          ))}
        </div>
        <span className="text-xs leading-[1.7] text-muted">{t(`tipos.${tipo}.d`)}</span>
      </div>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("nombre")}</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("correo")}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("correoPh")}
          className="field !bg-bg"
        />
        <span className="font-mono text-[10px] leading-[1.7] text-muted">
          {t("correoAyuda")}
        </span>
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("detalle")}</span>
        <textarea
          rows={4}
          value={detalle}
          onChange={(e) => setDetalle(e.target.value.slice(0, 2000))}
          placeholder={t("detallePh")}
          className="field !bg-bg resize-y leading-[1.6]"
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

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? t("enviando") : t("enviar")}
      </button>
    </form>
  );
}
