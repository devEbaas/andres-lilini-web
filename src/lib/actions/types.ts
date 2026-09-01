import { hasLocale } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";

/**
 * Normaliza el idioma que manda un formulario.
 *
 * Las Server Actions no pueden resolverlo por su cuenta —los getters de
 * `next/root-params` no corren aquí—, así que llega como dato del cliente.
 * Sólo decide en qué lengua se escribe y a qué URL se navega; nunca un
 * permiso ni un precio. Cualquier valor inesperado cae al español.
 */
export function normalizaLocale(valor: unknown): Locale {
  return hasLocale(routing.locales, valor) ? valor : routing.defaultLocale;
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const GENERIC_ERROR =
  "No pudimos registrar el envío. Inténtalo de nuevo en un momento.";

export function randomFolio(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
