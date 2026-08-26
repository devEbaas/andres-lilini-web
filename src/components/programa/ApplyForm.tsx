"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";

import { submitApplication, type ApplyPayload } from "@/lib/actions/apply";
import { APPLY_STEPS, type ApplyField } from "@/lib/content/programa";
import { Spinner } from "@/components/ui/Spinner";
import { btnSecondary, checkBox, checkRow } from "@/components/ui/styles";

const TOTAL = APPLY_STEPS.length;
const pad = (n: number) => String(n).padStart(2, "0");

export function ApplyForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ApplyPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [folio, setFolio] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();

  const current = APPLY_STEPS[step];
  const pct = Math.round(((step + 1) / TOTAL) * 100);

  const set = (key: string, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const goTo = (i: number) => {
    setStep(i);
    setFormError("");
  };

  const next = () => {
    if (step < TOTAL - 1) {
      goTo(step + 1);
      return;
    }
    setFormError("");
    startTransition(async () => {
      const res = await submitApplication(values);
      if (res.ok) {
        setFolio(res.data.folio);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setErrors(res.fieldErrors ?? {});
      setFormError(res.error);
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.7, 0.25, 1] }}
        className="border border-rule bg-surface p-[clamp(32px,5vw,58px)] text-center"
      >
        <div className="eyebrow mb-4">Acuse de recibo</div>
        <h2 className="m-0 mb-3.5 font-display text-[clamp(26px,3.4vw,40px)] font-normal">
          Postulación recibida
        </h2>
        <p className="m-0 mx-auto mb-[26px] max-w-[48ch] leading-[1.8] text-ink-soft">
          Un evaluador del programa revisa el material en un plazo de quince días hábiles. Si la
          solicitud avanza, recibirás una invitación a sesión presencial con fecha y sede.
        </p>
        <div className="inline-block border border-rule px-5 py-3.5 font-mono text-[13px] tracking-[0.1em]">
          FOLIO AL-2026-{folio}
        </div>
        <div className="mt-7">
          <button type="button" onClick={reset} className={btnSecondary}>
            Registrar otra postulación
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="border border-rule bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule p-[clamp(22px,3vw,32px)]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.12em] text-ink-faint">
            Sección {pad(step + 1)} de {pad(TOTAL)}
          </div>
          <h2 className="m-0 mt-2 font-display text-[clamp(22px,2.8vw,32px)] font-normal leading-[1.2]">
            {current.title}
          </h2>
        </div>
        <div className="font-mono text-xs text-ink-soft">{pct}% completado</div>
      </div>

      <div className="h-0.5 bg-rule-soft">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex overflow-x-auto border-b border-rule">
        {APPLY_STEPS.map((s, i) => (
          <button
            key={s.short}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === step ? "step" : undefined}
            className={`min-h-[46px] flex-[1_0_auto] cursor-pointer whitespace-nowrap border-0 border-b-2 border-r border-r-rule-soft px-[clamp(12px,1.6vw,20px)] py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
              i === step ? "border-b-accent text-ink" : "border-b-transparent text-ink-soft"
            } ${i < step ? "bg-surface-2" : "bg-transparent"}`}
          >
            {pad(i + 1)} · {s.short}
          </button>
        ))}
      </div>

      {/* Sin AnimatePresence: el paso nuevo monta de inmediato, así el
          formulario nunca queda vacío si la animación se interrumpe. */}
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28 }}
        className="grid gap-[clamp(16px,2vw,22px)] p-[clamp(18px,3.2vw,38px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,215px),1fr))]"
      >
        {current.fields.map((f) => (
          <Field
            key={f.key}
            field={f}
            value={values[f.key]}
            error={errors[f.key]}
            onChange={(v) => set(f.key, v)}
          />
        ))}
      </motion.div>

      {formError && (
        <p
          role="alert"
          className="mx-[clamp(18px,3.2vw,38px)] mb-4 border border-danger/40 px-4 py-3 text-sm text-danger"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule p-[clamp(20px,3vw,30px)]">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`min-h-[46px] cursor-pointer border border-rule bg-transparent px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:cursor-default ${
            step === 0 ? "text-ink-faint" : "text-ink"
          }`}
        >
          Sección anterior
        </button>
        <button
          type="button"
          onClick={next}
          disabled={pending}
          className="flex min-h-[46px] cursor-pointer items-center gap-2.5 border-0 bg-ink px-7 py-[15px] text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-250 hover:bg-accent disabled:opacity-60"
        >
          {pending && <Spinner />}
          {pending ? "Enviando" : step === TOTAL - 1 ? "Enviar postulación" : "Siguiente sección"}
        </button>
      </div>
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
  error?: string;
  onChange: (v: string | boolean) => void;
}) {
  const id = `f-${field.key}`;
  const text = typeof value === "string" ? value : "";
  const invalid = Boolean(error);

  return (
    <div className={`flex flex-col gap-2 ${field.wide ? "col-span-full" : ""}`}>
      {field.label && (
        <label htmlFor={id} className="label-caps">
          {field.label}
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
          <option value="">Elija una opción</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}

      {field.type === "radio" && (
        <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const on = text === o;
            return (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(o)}
                className={`min-h-[46px] cursor-pointer border px-[18px] py-3 text-[13px] font-medium transition-colors duration-200 ${
                  on ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink-soft"
                }`}
              >
                {o}
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
          placeholder={field.ph}
          aria-invalid={invalid}
          className="field resize-y leading-[1.7]"
        />
      )}

      {field.type === "check" && (
        <button
          type="button"
          role="checkbox"
          aria-checked={value === true}
          onClick={() => onChange(!value)}
          className={`${checkRow} ${invalid ? "border-danger" : "border-rule"}`}
        >
          <span
            className={checkBox}
            style={{ background: value ? "var(--accent)" : "transparent" }}
          >
            {value ? "✓" : ""}
          </span>
          <span className="text-sm leading-[1.7] text-ink-soft">{field.ph}</span>
        </button>
      )}

      {["text", "email", "tel", "date", "number"].includes(field.type) && (
        <input
          id={id}
          type={field.type}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.ph}
          aria-invalid={invalid}
          className="field"
        />
      )}

      {field.hint && !error && (
        <span className="font-mono text-[10px] text-ink-faint">{field.hint}</span>
      )}
      {error && (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
