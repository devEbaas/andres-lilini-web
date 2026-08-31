"use client";

import { useState, useTransition } from "react";

import { marcarMensaje } from "@/lib/actions/admin";

export function MarcarMensaje({ id, inicial }: { id: string; inicial: boolean }) {
  const [atendido, setAtendido] = useState(inicial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const alternar = () => {
    const previo = atendido;
    const nuevo = !previo;
    setAtendido(nuevo);
    setError("");
    startTransition(async () => {
      const res = await marcarMensaje(id, nuevo);
      if (!res.ok) {
        setAtendido(previo);
        setError(res.error);
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
          {error}
        </span>
      )}
    </div>
  );
}
