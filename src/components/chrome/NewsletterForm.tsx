"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { subscribe } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await subscribe(email);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-12 items-center gap-3 rounded-full border border-accent bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-5 py-[13px] text-sm"
        >
          <span className="font-extrabold text-accent">✓</span>
          Listo, te escribimos el primer lunes del mes.
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          noValidate
        >
          <div className="flex flex-wrap gap-2.5">
            <label className="sr-only" htmlFor="newsletter-email">
              Correo electrónico
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@dominio.com"
              aria-invalid={Boolean(error)}
              className="field flex-1 basis-[200px] rounded-full !bg-bg px-4"
            />
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 cursor-pointer rounded-full border-0 bg-gradient-accent px-[26px] py-[13px] text-[11px] font-extrabold uppercase tracking-[0.16em] text-on-accent disabled:opacity-60"
            >
              {pending ? "Enviando" : "Suscribirme"}
            </button>
          </div>
          {error && (
            <p className="m-0 mt-2 text-[13px] text-danger-text" role="alert">
              {error}
            </p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
