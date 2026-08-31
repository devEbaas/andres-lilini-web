"use client";

import { useState, useTransition } from "react";

import { solicitarReset } from "@/lib/actions/cuenta";
import { Spinner } from "@/components/ui/Spinner";

export function RecuperarForm() {
  const [email, setEmail] = useState("");
  const [hecho, setHecho] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await solicitarReset(email);
      // Siempre ok: la respuesta no cambia según exista o no la cuenta.
      if (res.ok) setHecho(res.data.mensaje);
    });
  };

  if (hecho) {
    return <p className="m-0 leading-[1.7] text-muted">{hecho}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Correo</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
          className="field !bg-bg"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Enviando" : "Enviar enlace"}
      </button>
    </form>
  );
}
