"use client";

import { useState, useTransition } from "react";

import { reemitirEnlaceTutor } from "@/lib/actions/tutor";
import { TUTOR_DIAS } from "@/lib/content/jugador";
import { Spinner } from "@/components/ui/Spinner";
import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

/**
 * Reemite el enlace de autorización del tutor y lo muestra **una vez**.
 *
 * Existe porque el enlace original sólo viaja por correo y en la base queda
 * únicamente su hash: sin este botón, una postulación de menor cuyo correo no
 * salió se quedaba sin salida. Al reemitir, el enlace anterior deja de valer.
 */
export function EnlaceTutor({ id, verificado }: { id: string; verificado: boolean }) {
  const err = useErrores();
  const [url, setUrl] = useState("");
  const [porCorreo, setPorCorreo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  // Ya autorizada: no hay nada que reemitir, y ofrecerlo invitaría a invalidar
  // una autorización válida por error.
  if (verificado) return null;

  const reemitir = () => {
    setError(null);
    setCopiado(false);
    startTransition(async () => {
      const res = await reemitirEnlaceTutor(id);
      if (res.ok) {
        setUrl(res.data.url);
        setPorCorreo(res.data.enviado);
      } else setError(res.code);
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
      <div className="mt-1.5 grid gap-2 rounded-[14px] border border-accent/40 bg-panel-2 p-3">
        <p className="m-0 text-[11px] leading-[1.5] text-muted">
          {porCorreo
            ? "Enviado por correo al tutor. "
            : "No se pudo enviar por correo: cópialo y hazlo llegar tú. "}
          No se vuelve a mostrar. Caduca en {TUTOR_DIAS} días.
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
    <div className="mt-1.5 grid gap-1.5">
      <button
        type="button"
        onClick={reemitir}
        disabled={pending}
        className="flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-hairline bg-transparent px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted transition hover:border-accent hover:text-ink disabled:opacity-60"
      >
        {pending && <Spinner />}
        Reenviar autorización
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {err(error)}
        </span>
      )}
    </div>
  );
}
