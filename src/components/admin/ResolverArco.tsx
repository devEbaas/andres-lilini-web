"use client";

import { useState, useTransition } from "react";

import { resolverSolicitudArco } from "@/lib/actions/privacidad";
import type { ArcoStatus } from "@/lib/supabase/types";

const ETIQUETAS: Record<ArcoStatus, string> = {
  recibida: "Recibida",
  en_proceso: "En proceso",
  atendida: "Atendida",
  rechazada: "Rechazada",
};

export function ResolverArco({
  id,
  status,
  nota,
}: {
  id: string;
  status: ArcoStatus;
  nota: string;
}) {
  const [estado, setEstado] = useState<ArcoStatus>(status);
  const [texto, setTexto] = useState(nota);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  const guardar = (nuevo: ArcoStatus, notaNueva: string) => {
    setError("");
    setGuardado(false);
    startTransition(async () => {
      const res = await resolverSolicitudArco({ id, status: nuevo, nota: notaNueva });
      if (res.ok) setGuardado(true);
      else setError(res.error);
    });
  };

  return (
    <div className="grid gap-2.5">
      <select
        value={estado}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value as ArcoStatus;
          setEstado(v);
          guardar(v, texto);
        }}
        aria-label="Estado de la solicitud"
        className="min-h-9 cursor-pointer appearance-none rounded-full border border-hairline bg-transparent px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink transition hover:border-accent disabled:opacity-60"
      >
        {(Object.keys(ETIQUETAS) as ArcoStatus[]).map((k) => (
          <option key={k} value={k}>
            {ETIQUETAS[k]}
          </option>
        ))}
      </select>

      <textarea
        rows={2}
        value={texto}
        onChange={(e) => setTexto(e.target.value.slice(0, 2000))}
        onBlur={() => texto !== nota && guardar(estado, texto)}
        placeholder="Cómo se acreditó la identidad y qué se hizo"
        className="field !bg-bg resize-y !text-xs leading-[1.6]"
      />

      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {error}
        </span>
      )}
      {guardado && !error && <span className="text-[11px] text-accent">Guardado.</span>}
    </div>
  );
}
