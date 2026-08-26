"use client";

import { useState, useTransition } from "react";
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

  if (done) {
    return (
      <div className="flex min-h-[46px] items-center gap-2.5 border border-accent px-4 py-3 text-sm text-ink-soft">
        <span className="text-accent">✓</span>
        Registrado. El primer envío llega el próximo lunes.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
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
          className="field flex-1 basis-[200px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-[46px] cursor-pointer border-0 bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors duration-250 hover:bg-accent disabled:opacity-60"
        >
          {pending ? "Enviando" : "Suscribirme"}
        </button>
      </div>
      {error && (
        <p className="m-0 mt-2 text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
