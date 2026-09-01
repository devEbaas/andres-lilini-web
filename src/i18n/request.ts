import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * Configuración por petición: qué idioma y con qué mensajes se renderiza.
 *
 * `requestLocale` puede llegar indefinido o inválido: el segmento `[lang]`
 * actúa como comodín, así que una petición a `/algo-que-no-existe.txt` entra
 * aquí con `lang = "algo-que-no-existe.txt"`. `hasLocale` estrecha el tipo y
 * deja el español como red de seguridad.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const solicitado = await requestLocale;
  const locale = hasLocale(routing.locales, solicitado) ? solicitado : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // El sitio opera desde México: fija la zona para que las fechas
    // renderizadas en el servidor y en el navegador coincidan.
    timeZone: "America/Mexico_City",
  };
});
