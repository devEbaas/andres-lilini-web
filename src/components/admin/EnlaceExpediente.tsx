"use client";

import { useState, useTransition } from "react";

import { generarEnlaceExpediente } from "@/lib/actions/expediente";
import { EXPEDIENTE_DIAS } from "@/lib/content/jugador";
import { Spinner } from "@/components/ui/Spinner";
import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

/**
 * Genera el enlace privado de un preseleccionado y lo muestra **una vez**.
 *
 * No hay forma de volver a verlo: en la base sólo queda el hash. Es una
 * limitación buscada, no un descuido — si se pierde, se regenera, y el
 * anterior deja de funcionar, que es justo lo que se quiere si acabó donde
 * no debía.
 */
export function EnlaceExpediente({
  id,
  enviado,
}: {
  id: string;
  enviado: string | null;
}) {
  const err = useErrores();
  const [url, setUrl] = useState("");
  const [porCorreo, setPorCorreo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const generar = () => {
    setError(null);
    setCopiado(false);
    startTransition(async () => {
      const res = await generarEnlaceExpediente(id);
      if (res.ok) {
        setUrl(res.data.url);
        setPorCorreo(res.data.enviado);
      }
      else setError(res.code);
    });
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      setError("noSePudoCopiar");
    }
  };

  if (url) {
    return (
      <div className="grid gap-2 rounded-[14px] border border-accent/40 bg-panel-2 p-3">
        <p className="m-0 text-[11px] leading-[1.5] text-muted">
          {porCorreo
            ? "Enviado por correo al jugador. "
            : "No se pudo enviar por correo: cópialo y mándaselo tú. "}
          No se vuelve a mostrar. Caduca en {EXPEDIENTE_DIAS} días.
        </p>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="field !bg-bg font-mono !text-[10px]"
        />
        <button
          type="button"
          onClick={copiar}
          className="min-h-9 cursor-pointer rounded-full border border-accent bg-transparent px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent"
        >
          {copiado ? "Copiado ✓" : "Copiar enlace"}
        </button>
        {error && (
          <span role="alert" className="text-[11px] text-danger-text">
            {err(error)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      {enviado && (
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent">
          Recibido
        </span>
      )}
      <button
        type="button"
        onClick={generar}
        disabled={pending}
        className="flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-hairline bg-transparent px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted transition hover:border-accent hover:text-ink disabled:opacity-60"
      >
        {pending && <Spinner />}
        {enviado ? "Reabrir" : "Generar enlace"}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {err(error)}
        </span>
      )}
    </div>
  );
}
