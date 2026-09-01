import { hasLocale } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import type mensajes from "../../../messages/es.json";

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

/**
 * Las claves del espacio `avisos`: lo que una acción responde cuando sale
 * bien. Mismo motivo que `ErrorKey` — la acción dice *qué* pasó y el cliente
 * decide en qué idioma se lee, porque una Server Action no conoce el suyo.
 */
export type AvisoKey = keyof (typeof mensajes)["avisos"];

/**
 * Las claves del espacio `errors`, tomadas del catálogo español.
 *
 * Se derivan del propio JSON en vez de escribirse a mano: una clave que no
 * exista no compila, y añadir un mensaje al catálogo basta para poder usarlo.
 */
export type ErrorKey = keyof (typeof mensajes)["errors"];

/**
 * Un error listo para traducir.
 *
 * Casi siempre es la clave sola. La forma con `p` existe para el puñado de
 * mensajes que llevan datos dentro —«tendrías 23 años»—, que sin parámetros
 * habría que partir en trozos y dejaría al traductor sin la frase entera.
 */
export type ErrorRef = ErrorKey | { k: ErrorKey; p: Record<string, string | number> };

/**
 * Lo que devuelve una Server Action.
 *
 * El fallo viaja como clave, no como frase: la acción declara *qué* pasó y la
 * vista decide cómo se dice, en el idioma que esté usando quien mira. Antes
 * la misma frase estaba escrita cuatro veces con puntuación distinta.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; code: ErrorRef; fieldErrors?: Record<string, ErrorRef> };

export const GENERIC_ERROR: ErrorKey = "generico";

export function randomFolio(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
