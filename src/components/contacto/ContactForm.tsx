"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import { submitContact } from "@/lib/actions/contact";
import { CONTACT_TOPICS } from "@/lib/content/site";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";

const MAX = 800;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const tt = useTranslations("contact.topics");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await submitContact({ nombre, email, topic, message, consent, locale });
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-5 text-center"
      >
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-gradient-accent text-2xl font-extrabold text-on-accent">
          ✓
        </div>
        <h3 className="m-0 mb-2.5 font-display text-[28px] uppercase">{t("enviadoTitulo")}</h3>
        <p className="m-0 mb-5 leading-[1.7] text-muted">{t("enviadoTexto")}</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMessage("");
            setConsent(false);
          }}
          className={btnQuiet}
        >
          {t("enviarOtro")}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("nombre")}</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={t("nombrePlaceholder")}
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("correo")}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("correoPlaceholder")}
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("tema")}</span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="field !bg-bg appearance-none"
        >
          {CONTACT_TOPICS.map((clave) => (
            <option key={clave} value={clave}>
              {tt(clave)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("mensaje")}</span>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          placeholder={t("mensajePlaceholder")}
          className="field !bg-bg resize-y leading-[1.6]"
        />
        <span className="text-right font-mono text-[10px] text-muted">
          {message.length} / {MAX}
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
          {t("consentimiento")}
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
        {pending ? t("enviando") : t("enviar")}
      </button>
    </form>
  );
}
