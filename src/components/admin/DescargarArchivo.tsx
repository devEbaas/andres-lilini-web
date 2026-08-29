"use client";

import { useState, useTransition } from "react";

import { urlArchivoConvocatoria } from "@/lib/actions/admin";

/**
 * Pide el enlace firmado en el momento de pulsar, no al renderizar la lista.
 *
 * Si las URLs se generaran al pintar la tabla, cada carga del panel dejaría
 * una tanda de enlaces válidos en el HTML, y en la auditoría constaría una
 * descarga por cada archivo aunque no se abriera ninguno.
 */
export function DescargarArchivo({ id, nombre }: { id: string; nombre: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const descargar = () => {
    setError("");
    startTransition(async () => {
      const res = await urlArchivoConvocatoria(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // El enlace lleva Content-Disposition: attachment, así que esto descarga
      // sin sacar al usuario del panel.
      window.location.href = res.data.url;
    });
  };

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={descargar}
        disabled={pending}
        className="cursor-pointer border-0 bg-transparent p-0 text-left font-mono text-xs text-accent underline underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Firmando…" : nombre}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {error}
        </span>
      )}
    </div>
  );
}
