"use client";

import { useState, useTransition } from "react";

import { marcarMensaje } from "@/lib/actions/admin";
import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

export function MarcarMensaje({ id, inicial }: { id: string; inicial: boolean }) {
  const err = useErrores();
  const [atendido, setAtendido] = useState(inicial);
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const alternar = () => {
    const previo = atendido;
    const nuevo = !previo;
    setAtendido(nuevo);
    setError(null);
    startTransition(async () => {
      const res = await marcarMensaje(id, nuevo);
      if (!res.ok) {
        setAtendido(previo);
        setError(res.code);
      }
    });
  };

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={alternar}
        disabled={pending}
        aria-pressed={atendido}
        className={`min-h-9 cursor-pointer rounded-full border px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] transition disabled:opacity-60 ${
          atendido
            ? "border-accent bg-panel-2 text-accent"
            : "border-hairline bg-transparent text-muted hover:border-accent hover:text-ink"
        }`}
      >
        {atendido ? "Atendido" : "Pendiente"}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {err(error)}
        </span>
      )}
    </div>
  );
}
