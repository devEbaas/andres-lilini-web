"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";

import { submitContact } from "@/lib/actions/contact";
import { CONTACT_TOPICS } from "@/lib/content/site";
import { Spinner } from "@/components/ui/Spinner";
import { btnSecondary, checkBox, checkRow } from "@/components/ui/styles";

const MAX = 800;

export function ContactForm() {
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
      const res = await submitContact({ nombre, email, topic, message, consent });
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-5 text-center"
      >
        <div className="eyebrow mb-3.5">Acuse de recibo</div>
        <h3 className="m-0 mb-2.5 font-display text-[28px] font-normal">Mensaje enviado</h3>
        <p className="m-0 mb-[22px] leading-[1.8] text-ink-soft">
          Se responde en un plazo de tres a cinco días hábiles.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMessage("");
            setConsent(false);
          }}
          className={btnSecondary}
        >
          Enviar otro mensaje
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <label className="flex flex-col gap-2">
        <span className="label-caps">Nombre</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre y apellidos"
          className="field"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label-caps">Correo electrónico</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
          className="field"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="label-caps">Tema</span>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="field appearance-none"
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="label-caps">Mensaje</span>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          placeholder="Exponga el asunto con el detalle necesario"
          className="field resize-y leading-[1.7]"
        />
        <span className="text-right font-mono text-[10px] text-ink-faint">
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
        className={`${checkRow} border-rule`}
      >
        <span
          className={checkBox}
          style={{ background: consent ? "var(--accent)" : "transparent" }}
        >
          {consent ? "✓" : ""}
        </span>
        <span className="text-sm leading-[1.7] text-ink-soft">
          Acepto el tratamiento de mis datos conforme al aviso de privacidad.
        </span>
      </button>

      {error && (
        <div role="alert" className="border border-danger/40 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[50px] cursor-pointer items-center justify-center gap-2.5 border-0 bg-ink text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-250 hover:bg-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Enviando" : "Enviar mensaje"}
      </button>
    </form>
  );
}
