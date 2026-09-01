import { lang } from "next/root-params";
import { hasLocale } from "next-intl";
import { getLocale, setRequestLocale } from "next-intl/server";

import { routing, type Locale } from "./routing";
import { conIdioma } from "./rutas";

/**
 * Fija el idioma de la petición a partir del segmento `[lang]`.
 *
 * Hay que llamarlo al principio de **cada page y layout** bajo `app/[lang]/`.
 * Sin esto, next-intl resuelve el idioma leyendo la cabecera que le pone el
 * proxy, y `headers()` convierte la página en dinámica: el build lo delata
 * como `ƒ` en vez de `●`. El del layout no cubre a la página porque Next los
 * renderiza por separado.
 *
 * `next/root-params` da el valor sin tocar la petición, así que el prerender
 * sigue siendo posible.
 */
export async function fijarIdioma(): Promise<Locale> {
  const actual = await lang();
  const locale = hasLocale(routing.locales, actual) ? actual : routing.defaultLocale;
  setRequestLocale(locale);
  return locale;
}

/**
 * El idioma de la petición actual, ya validado.
 *
 * Funciona en Server Components y en utilidades del servidor. No en Server
 * Actions ni en Route Handlers: ahí el idioma llega como parámetro explícito
 * —ver `signIn` y `verificarMfa`—.
 */
export async function localeActual(): Promise<Locale> {
  const actual = await getLocale();
  return hasLocale(routing.locales, actual) ? actual : routing.defaultLocale;
}

/**
 * Una ruta interna en el idioma de la petición, lista para `redirect()`.
 *
 * `await rutaLocal("/cuenta")` → `/cuenta` en español, `/en/account` en inglés.
 */
export async function rutaLocal(interna: string): Promise<string> {
  return conIdioma(interna, await localeActual());
}
