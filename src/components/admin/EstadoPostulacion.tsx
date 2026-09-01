"use client";

import { useState, useTransition } from "react";

import { setEstadoPostulacion } from "@/lib/actions/admin";
import type { ApplicationStatus } from "@/lib/supabase/types";
import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

const ETIQUETAS: Record<ApplicationStatus, string> = {
  recibida: "Recibida",
  en_revision: "En revisión",
  preseleccionada: "Preseleccionada",
  aceptada: "Aceptada",
  descartada: "Descartada",
};

export function EstadoPostulacion({
  id,
  inicial,
}: {
  id: string;
  inicial: ApplicationStatus;
}) {
  const err = useErrores();
  const [estado, setEstado] = useState<ApplicationStatus>(inicial);
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const onChange = (nuevo: ApplicationStatus) => {
    const previo = estado;
    setEstado(nuevo);
    setError(null);
    startTransition(async () => {
      const res = await setEstadoPostulacion(id, nuevo);
      if (!res.ok) {
        setEstado(previo); // Revierte: la base manda, no la pantalla.
        setError(res.code);
      }
    });
  };

  return (
    <div className="grid gap-1.5">
      <select
        value={estado}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as ApplicationStatus)}
        aria-label="Estado de la postulación"
        className="min-h-9 cursor-pointer appearance-none rounded-full border border-hairline bg-transparent px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink transition hover:border-accent disabled:opacity-60"
      >
        {(Object.keys(ETIQUETAS) as ApplicationStatus[]).map((k) => (
          <option key={k} value={k}>
            {ETIQUETAS[k]}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {err(error)}
        </span>
      )}
    </div>
  );
}
