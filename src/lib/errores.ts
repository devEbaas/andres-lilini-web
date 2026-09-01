"use client";

import { useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";

/**
 * Traduce lo que devuelve una Server Action.
 *
 * Las acciones declaran *qué* falló con una clave; aquí se decide cómo se
 * dice. El estado de los formularios guarda la clave, no la frase: si alguien
 * cambia de idioma con un error en pantalla, el error cambia con él.
 *
 *   const err = useErrores();
 *   {error && <p>{err(error)}</p>}
 */
export function useErrores() {
  const t = useTranslations("errors");
  return (e: ErrorRef | undefined | null) => {
    if (!e) return "";
    return typeof e === "string" ? t(e) : t(e.k, e.p);
  };
}
