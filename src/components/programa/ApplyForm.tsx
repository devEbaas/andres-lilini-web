"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

import { submitApplication, type ApplyPayload, type ClubEntry } from "@/lib/actions/apply";
import { APPLY_STEPS, type ApplyField } from "@/lib/content/programa";
import { CATEGORIAS, MAX_CLUBES } from "@/lib/content/jugador";
import { esMenorHoy } from "@/lib/edad";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";

const TOTAL = APPLY_STEPS.length;

export function ApplyForm() {
  const err = useErrores();
  const t = useTranslations("programa.form");
  const locale = useLocale();
  const ts = useTranslations("programa.steps");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ApplyPayload>({});
  const [errors, setErrors] = useState<Record<string, ErrorRef>>({});
  const [folio, setFolio] = useState<string | null>(null);
  const [formError, setFormError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const current = APPLY_STEPS[step];
  const pct = Math.round(((step + 1) / TOTAL) * 100);

  // Se mide con la fecha de hoy, no con ninguna fecha de cierre: es cuando
  // se otorga el consentimiento. A un mayor de edad ni se le enseñan los
  // campos del tutor — no hay tutor que registrar.
  const nac = String(values.nac ?? "");
  const esMenor = Boolean(nac) && esMenorHoy(nac);
  const visibles = current.fields.filter((f) => !f.soloMenores || esMenor);

  const set = (key: string, value: string | boolean | ClubEntry[]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors(({ [key]: _quitado, ...resto }) => resto);
  };

  const goTo = (i: number) => {
    setStep(i);
    setFormError(null);
  };

  const next = () => {
    if (step < TOTAL - 1) {
      goTo(step + 1);
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const res = await submitApplication(values, locale);
      if (res.ok) {
        setFolio(res.data.folio);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setErrors(res.fieldErrors ?? {});
      setFormError(res.code);
      // Lleva al usuario al primer paso que tenga un campo con error.
      const bad = Object.keys(res.fieldErrors ?? {})[0];
      if (bad) {
        const idx = APPLY_STEPS.findIndex((s) => s.fields.some((f) => f.key === bad));
        if (idx >= 0) setStep(idx);
      }
    });
  };

  const reset = () => {
    setFolio(null);
    setStep(0);
    setValues({});
    setErrors({});
  };

  if (folio) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        className="rounded-[26px] border border-hairline bg-panel p-[clamp(34px,5vw,64px)] text-center shadow-deep"
      >
        <div className="mx-auto mb-[26px] grid size-16 place-items-center rounded-full bg-gradient-accent text-[28px] font-extrabold text-on-accent">
          ✓
        </div>
        <h2 className="m-0 mb-3.5 font-display text-[clamp(30px,4vw,52px)] uppercase leading-[0.95]">
          {t("recibidaTitulo")}
        </h2>
        <p className="mx-auto m-0 mb-6 max-w-[46ch] leading-[1.7] text-muted">
          {t("recibidaTexto")}
        </p>
        <div className="inline-block rounded-[14px] border border-dashed border-hairline-strong p-4 font-mono text-[13px] tracking-[0.14em]">
          {t("folio", { folio })}
        </div>
        <div className="mt-[30px]">
          <button type="button" onClick={reset} className={btnQuiet}>
            {t("otraPostulacion")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-hairline bg-white/[0.03] shadow-deep backdrop-blur-[16px]">
      <div className="flex flex-wrap items-center justify-between gap-[18px] border-b border-hairline p-[clamp(22px,3vw,32px)]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted">
            {t("seccion", {
              n: String(step + 1).padStart(2, "0"),
              total: String(TOTAL).padStart(2, "0"),
            })}
          </div>
          <h2 className="m-0 mt-2 font-display text-[clamp(22px,3vw,34px)] uppercase leading-none">
            {ts(`${current.key}.title`)}
          </h2>
        </div>
        <div className="font-display text-[34px] text-muted">{pct}%</div>
      </div>

      <div className="h-[3px] bg-hairline">
        <motion.div
          className="h-full bg-gradient-accent"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-hairline px-[clamp(22px,3vw,32px)] py-[18px]">
        {APPLY_STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === step ? "step" : undefined}
            className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 ${
              i === step
                ? "border-accent text-ink"
                : "border-hairline text-muted hover:text-ink"
            } ${i < step ? "bg-panel-2" : "bg-transparent"}`}
          >
            {String(i + 1).padStart(2, "0")} · {ts(`${s.key}.short`)}
          </button>
        ))}
      </div>

      {/* Sin AnimatePresence: el paso nuevo monta de inmediato, así el
          formulario nunca queda vacío si la animación se interrumpe. */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        className="grid gap-[22px] p-[clamp(24px,3.5vw,40px)] [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]"
      >
        {esMenor && current.fields.some((f) => f.soloMenores) && (
          <p className="col-span-full m-0 rounded-[14px] border border-accent/40 bg-panel-2 px-4 py-3.5 text-sm leading-[1.7] text-muted">
            {t("avisoMenor")}
          </p>
        )}
        {visibles.map((f) =>
          f.type === "clubes" ? (
            <Clubes
              key={f.key}
              field={f}
              value={Array.isArray(values[f.key]) ? (values[f.key] as ClubEntry[]) : []}
              onChange={(v) => set(f.key, v)}
            />
          ) : (
            <Field
              key={f.key}
              field={f}
              value={values[f.key] as string | boolean | undefined}
              error={errors[f.key]}
              onChange={(v) => set(f.key, v)}
            />
          ),
        )}
      </motion.div>

      {formError && (
        <p
          role="alert"
          className="mx-[clamp(24px,3.5vw,40px)] mb-2 rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {err(formError)}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline p-[clamp(20px,3vw,32px)]">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`min-h-11 cursor-pointer rounded-full border border-hairline bg-transparent px-[26px] py-[15px] text-[11px] font-extrabold uppercase tracking-[0.18em] ${
            step === 0 ? "text-muted" : "text-ink"
          } disabled:cursor-default`}
        >
          {t("anterior")}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={pending}
          className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border-0 bg-gradient-accent px-[30px] py-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
        >
          {pending && <Spinner />}
          {pending ? t("enviando") : step === TOTAL - 1 ? t("enviar") : t("siguiente")}
        </button>
      </div>
    </div>
  );
}

const VACIO: ClubEntry = { club: "", categoria: "", desde: "", hasta: "" };

/**
 * Repetidor del historial de clubes.
 *
 * Es opcional a propósito: pedirlo obligatorio en un formulario que ya
 * tiene seis pasos añadiría fricción sin ganar nada. Quien lo llena da
 * contexto; quien no, no queda penalizado.
 */
function Clubes({
  field,
  value,
  onChange,
}: {
  field: ApplyField;
  value: ClubEntry[];
  onChange: (v: ClubEntry[]) => void;
}) {
  const t = useTranslations("programa.form");
  const tf = useTranslations("programa.f");
  const tv = useTranslations("vocab");
  const filas = value.length ? value : [VACIO];

  const editar = (i: number, k: keyof ClubEntry, v: string) => {
    const copia = filas.map((f, j) => (i === j ? { ...f, [k]: v } : f));
    onChange(copia);
  };

  return (
    <div className="col-span-full grid gap-3">
      <span className="label-caps">{tf(`${field.key}.label`)}</span>
      <span className="-mt-1 font-mono text-[10px] leading-[1.6] text-muted">
        {tf(`${field.key}.hint`)}
      </span>

      {filas.map((fila, i) => (
        <div
          key={i}
          className="grid items-end gap-3 rounded-2xl border border-hairline bg-panel p-3.5 [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]"
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {t("club")}
            </span>
            <input
              value={fila.club}
              onChange={(e) => editar(i, "club", e.target.value)}
              placeholder={t("clubPh")}
              className="field !bg-bg"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {t("categoria")}
            </span>
            <select
              value={fila.categoria}
              onChange={(e) => editar(i, "categoria", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {tv(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {t("desde")}
            </span>
            <input
              value={fila.desde}
              onChange={(e) => editar(i, "desde", e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder={t("desdePh")}
              className="field !bg-bg"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {t("hasta")}
            </span>
            <input
              value={fila.hasta}
              onChange={(e) => editar(i, "hasta", e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder={t("hastaPh")}
              className="field !bg-bg"
            />
          </label>
          {filas.length > 1 && (
            <button
              type="button"
              aria-label={t("quitarClub", { n: i + 1 })}
              onClick={() => onChange(filas.filter((_, j) => j !== i))}
              className="size-11 shrink-0 cursor-pointer rounded-full border border-hairline bg-transparent text-muted hover:border-accent hover:text-ink"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {filas.length < MAX_CLUBES && (
        <button
          type="button"
          onClick={() => onChange([...filas, { ...VACIO }])}
          className={btnQuiet}
        >
          {t("anadirClub")}
        </button>
      )}
    </div>
  );
}

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: ApplyField;
  value: string | boolean | undefined;
  error?: ErrorRef;
  onChange: (v: string | boolean) => void;
}) {
  const err = useErrores();
  const t = useTranslations("programa.form");
  const tf = useTranslations("programa.f");
  const tv = useTranslations("vocab");

  const id = `f-${field.key}`;
  const text = typeof value === "string" ? value : "";
  const invalid = Boolean(error);

  // No todos los campos tienen marcador o ayuda: `has` evita pedir una clave
  // que no existe, que en next-intl devolvería el propio nombre de la clave.
  const label = tf(`${field.key}.label`);
  const ph = tf.has(`${field.key}.ph`) ? tf(`${field.key}.ph`) : undefined;
  const hint = tf.has(`${field.key}.hint`) ? tf(`${field.key}.hint`) : undefined;

  return (
    <div
      className={`flex flex-col gap-[9px] ${field.wide ? "col-span-full" : ""}`}
    >
      {label && (
        <label htmlFor={id} className="label-caps">
          {label}
          {field.required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}

      {field.type === "select" && (
        <select
          id={id}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          className="field appearance-none"
        >
          <option value="">{t("elige")}</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {tv(o)}
            </option>
          ))}
        </select>
      )}

      {field.type === "radio" && (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const on = text === o;
            return (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(o)}
                className={`min-h-11 cursor-pointer rounded-[14px] border px-4 py-3 text-xs font-bold tracking-[0.06em] transition-all duration-[250ms] ${
                  on ? "border-accent bg-panel-2 text-ink" : "border-hairline bg-panel text-muted"
                }`}
              >
                {tv(o)}
              </button>
            );
          })}
        </div>
      )}

      {field.type === "area" && (
        <textarea
          id={id}
          rows={4}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          aria-invalid={invalid}
          className="field resize-y leading-[1.6]"
        />
      )}

      {field.type === "check" && (
        <button
          type="button"
          role="checkbox"
          aria-checked={value === true}
          onClick={() => onChange(!value)}
          className={`flex min-h-11 cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-left ${
            invalid ? "border-danger" : "border-hairline"
          } bg-panel`}
        >
          <span
            className="grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-hairline-strong text-[13px] font-extrabold text-on-accent"
            style={{ background: value ? "var(--accent)" : "transparent" }}
          >
            {value ? "✓" : ""}
          </span>
          <span className="text-sm leading-[1.6] text-muted">{ph}</span>
        </button>
      )}

      {["text", "email", "tel", "date", "number"].includes(field.type) && (
        <input
          id={id}
          type={field.type}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          aria-invalid={invalid}
          className="field"
        />
      )}

      {hint && !error && <span className="font-mono text-[10px] text-muted">{hint}</span>}
      {error && (
        <span className="text-xs font-semibold text-danger-text" role="alert">
          {err(error)}
        </span>
      )}
    </div>
  );
}
