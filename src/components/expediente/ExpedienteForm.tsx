"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

import { enviarExpediente, type ExpedientePayload } from "@/lib/actions/expediente";
import {
  ALCANCES_IMAGEN,
  PARENTESCOS,
  PROTOCOLOS,
  SEGUROS,
  TESTS_AGILIDAD,
} from "@/lib/content/jugador";
import { Spinner } from "@/components/ui/Spinner";

type Errores = Record<string, ErrorRef>;

const VACIO: ExpedientePayload = {
  sprint10: "", sprint30: "", saltoCmj: "", agilidadTest: "", agilidadSeg: "",
  yoyo: "", protocolo: "", medidoEn: "",
  contactoNombre: "", contactoParentesco: "", contactoTel: "",
  alergias: "", condiciones: "", lesiones: "", seguro: "",
  okSalud: false, okImagen: false, imagenAlcance: "", firmanteNombre: "",
};

function Campo({
  label, name, errores, hint, ancho, children,
}: {
  label: string;
  name: string;
  errores: Errores;
  hint?: string;
  ancho?: boolean;
  children: React.ReactNode;
}) {
  const err = useErrores();
  const error = errores[name];
  return (
    <label className={`flex flex-col gap-[9px] ${ancho ? "col-span-full" : ""}`}>
      <span className="label-caps">{label}</span>
      {children}
      {hint && !error && (
        <span className="font-mono text-[10px] leading-[1.6] text-muted">{hint}</span>
      )}
      {error && (
        <span role="alert" className="text-[11px] leading-[1.5] text-danger-text">
          {err(error)}
        </span>
      )}
    </label>
  );
}

function Casilla({
  label, marcada, onToggle, error,
}: {
  label: string;
  marcada: boolean;
  onToggle: () => void;
  error?: ErrorRef;
}) {
  const err = useErrores();
  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={marcada}
        onClick={onToggle}
        className={`flex min-h-11 cursor-pointer items-start gap-3.5 rounded-2xl border bg-panel p-[15px] text-left ${
          error ? "border-danger/50" : "border-hairline"
        }`}
      >
        <span
          className="grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-hairline-strong text-[13px] font-extrabold text-on-accent"
          style={{ background: marcada ? "var(--accent)" : "transparent" }}
        >
          {marcada ? "✓" : ""}
        </span>
        <span className="text-sm leading-[1.6] text-muted">{label}</span>
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {err(error)}
        </span>
      )}
    </div>
  );
}

export function ExpedienteForm({
  token,
  esMenor,
  tutorNombre,
}: {
  token: string;
  esMenor: boolean;
  tutorNombre: string | null;
}) {
  const err = useErrores();
  const t = useTranslations("expediente.form");
  const tv = useTranslations("vocab");
  const [v, setV] = useState<ExpedientePayload>({
    ...VACIO,
    // En un menor firma el tutor, y su nombre ya se recogió al postularse.
    firmanteNombre: esMenor ? (tutorNombre ?? "") : "",
  });
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState<ErrorRef | null>(null);
  const [hecho, setHecho] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ExpedientePayload>(k: K, valor: ExpedientePayload[K]) => {
    setV((s) => ({ ...s, [k]: valor }));
    setErrores(({ [k]: _quitado, ...resto }) => resto);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await enviarExpediente(token, v);
      if (res.ok) {
        setHecho(res.data.folio);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setErrores(res.fieldErrors ?? {});
      setError(res.code);
    });
  };

  if (hecho) {
    return (
      <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(30px,5vw,52px)] text-center shadow-deep">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-gradient-accent text-2xl font-extrabold text-on-accent">
          ✓
        </div>
        <h2 className="m-0 mb-2.5 font-display text-[28px] uppercase">{t("okTitulo")}</h2>
        <p className="m-0 leading-[1.7] text-muted">
          {t("okTexto", { folio: hecho })}
        </p>
      </div>
    );
  }

  const rejilla = "grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-9">
      {/* ── Medibles ── */}
      <section>
        <h2 className="m-0 mb-2 font-display text-xl uppercase">{t("medibles")}</h2>
        <p className="m-0 mb-5 max-w-[62ch] text-sm leading-[1.7] text-muted">
          {t("mediblesLead")}
        </p>
        <div className={rejilla}>
          <Campo label={t("sprint10")} name="sprint10" errores={errores} hint={t("sprint10Hint")}>
            <input
              value={v.sprint10}
              onChange={(e) => set("sprint10", e.target.value)}
              inputMode="decimal"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label={t("sprint30")} name="sprint30" errores={errores} hint={t("sprint30Hint")}>
            <input
              value={v.sprint30}
              onChange={(e) => set("sprint30", e.target.value)}
              inputMode="decimal"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label={t("cmj")} name="saltoCmj" errores={errores} hint={t("cmjHint")}>
            <input
              value={v.saltoCmj}
              onChange={(e) => set("saltoCmj", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label={t("testAgilidad")} name="agilidadTest" errores={errores}>
            <select
              value={v.agilidadTest}
              onChange={(e) => set("agilidadTest", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {TESTS_AGILIDAD.map((o) => (
                <option key={o} value={o}>
                  {tv(o)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label={t("agilidad")} name="agilidadSeg" errores={errores}>
            <input
              value={v.agilidadSeg}
              onChange={(e) => set("agilidadSeg", e.target.value)}
              inputMode="decimal"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label={t("resistencia")} name="yoyo" errores={errores} hint={t("resistenciaHint")}>
            <input
              value={v.yoyo}
              onChange={(e) => set("yoyo", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
          <Campo label={t("protocolo")} name="protocolo" errores={errores}>
            <select
              value={v.protocolo}
              onChange={(e) => set("protocolo", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {PROTOCOLOS.map((p) => (
                <option key={p} value={p}>
                  {tv(p)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label={t("fechaMedicion")} name="medidoEn" errores={errores}>
            <input
              type="date"
              value={v.medidoEn}
              onChange={(e) => set("medidoEn", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
        </div>
      </section>

      {/* ── Contacto de emergencia ── */}
      <section>
        <h2 className="m-0 mb-2 font-display text-xl uppercase">{t("emergencia")}</h2>
        <p className="m-0 mb-5 max-w-[62ch] text-sm leading-[1.7] text-muted">
          {t("emergenciaLead")}
        </p>
        <div className={rejilla}>
          <Campo label={t("nombre")} name="contactoNombre" errores={errores}>
            <input
              value={v.contactoNombre}
              onChange={(e) => set("contactoNombre", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
          <Campo label={t("parentesco")} name="contactoParentesco" errores={errores}>
            <select
              value={v.contactoParentesco}
              onChange={(e) => set("contactoParentesco", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">{t("eligeUno")}</option>
              {PARENTESCOS.map((p) => (
                <option key={p} value={p}>
                  {tv(p)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label={t("telefono")} name="contactoTel" errores={errores}>
            <input
              type="tel"
              value={v.contactoTel}
              onChange={(e) => set("contactoTel", e.target.value)}
              placeholder={t("telefonoPh")}
              className="field !bg-bg"
            />
          </Campo>
        </div>
      </section>

      {/* ── Salud ── */}
      <section>
        <h2 className="m-0 mb-2 font-display text-xl uppercase">{t("salud")}</h2>
        <p className="m-0 mb-5 max-w-[62ch] text-sm leading-[1.7] text-muted">
          {t("saludLead")}
        </p>
        <div className="grid gap-5">
          <Campo label={t("alergias")} name="alergias" errores={errores} ancho>
            <textarea
              rows={2}
              value={v.alergias}
              onChange={(e) => set("alergias", e.target.value.slice(0, 500))}
              placeholder={t("alergiasPh")}
              className="field !bg-bg resize-y leading-[1.6]"
            />
          </Campo>
          <Campo label={t("condiciones")} name="condiciones" errores={errores} ancho>
            <textarea
              rows={2}
              value={v.condiciones}
              onChange={(e) => set("condiciones", e.target.value.slice(0, 500))}
              placeholder={t("condicionesPh")}
              className="field !bg-bg resize-y leading-[1.6]"
            />
          </Campo>
          <Campo label={t("lesiones")} name="lesiones" errores={errores} ancho>
            <textarea
              rows={2}
              value={v.lesiones}
              onChange={(e) => set("lesiones", e.target.value.slice(0, 500))}
              className="field !bg-bg resize-y leading-[1.6]"
            />
          </Campo>
          <Campo label={t("seguro")} name="seguro" errores={errores}>
            <select
              value={v.seguro}
              onChange={(e) => set("seguro", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {SEGUROS.map((s) => (
                <option key={s} value={s}>
                  {tv(s)}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </section>

      {/* ── Consentimientos ── */}
      <section className="grid gap-2.5">
        <h2 className="m-0 mb-2 font-display text-xl uppercase">{t("autorizaciones")}</h2>

        <Casilla
          label={t("okSalud")}
          marcada={v.okSalud}
          onToggle={() => set("okSalud", !v.okSalud)}
          error={errores.okSalud}
        />
        <Casilla
          label={t("okImagen")}
          marcada={v.okImagen}
          onToggle={() => set("okImagen", !v.okImagen)}
        />
        {v.okImagen && (
          <Campo
            label={t("alcance")}
            name="imagenAlcance"
            errores={errores}
            hint={t("alcanceHint")}
          >
            <select
              value={v.imagenAlcance}
              onChange={(e) => set("imagenAlcance", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">{t("eligeAlcance")}</option>
              {ALCANCES_IMAGEN.map((a) => (
                <option key={a} value={a}>
                  {tv(a)}
                </option>
              ))}
            </select>
          </Campo>
        )}

        <div className="mt-2">
          <Campo
            label={esMenor ? t("firmanteMenor") : t("firmanteMayor")}
            name="firmanteNombre"
            errores={errores}
            hint={esMenor ? t("firmanteHint") : undefined}
          >
            <input
              value={v.firmanteNombre}
              onChange={(e) => set("firmanteNombre", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="m-0 rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {err(error)}
        </p>
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
