import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getPathname } from "./navigation";
import { routing, type Locale } from "./routing";
import { localeActual } from "./servidor";

/** Lo que acepta `getPathname`: una ruta interna, con sus parámetros si los tiene. */
type Destino = Parameters<typeof getPathname>[0]["href"];

const OG_LOCALE: Record<Locale, string> = { es: "es_MX", en: "en_US" };

/**
 * Metadata de una página, con sus alternativas de idioma.
 *
 * El `hreflang` es obligatorio aquí, no opcional: el español vive en la raíz y
 * el inglés bajo `/en`, así que sin él un buscador no tiene forma de saber que
 * `/tienda` y `/en/store` son la misma página en dos lenguas, y las trata como
 * contenido duplicado.
 *
 * `x-default` apunta al español porque es el idioma del proyecto: es lo que
 * debe ver quien llega sin una preferencia clara.
 */
export async function metadatosDe(
  href: Destino,
  clave: string,
  opciones: { indexable?: boolean; extra?: Metadata } = {},
): Promise<Metadata> {
  const { indexable = true, extra } = opciones;

  const locale = await localeActual();
  const t = await getTranslations({ locale, namespace: "meta" });

  const title = t(`${clave}.title`);
  const description = t.has(`${clave}.description`)
    ? t(`${clave}.description`)
    : undefined;

  // Una página sin indexar no necesita alternativas: no hay nada que un
  // buscador tenga que relacionar.
  const alternates: Metadata["alternates"] = indexable
    ? {
        canonical: getPathname({ href, locale }),
        languages: {
          ...Object.fromEntries(
            routing.locales.map((l) => [l, getPathname({ href, locale: l })]),
          ),
          "x-default": getPathname({ href, locale: routing.defaultLocale }),
        },
      }
    : undefined;

  return {
    title,
    description,
    ...(alternates ? { alternates } : {}),
    ...(indexable
      ? {
          openGraph: {
            type: "website",
            siteName: t("sitio"),
            locale: OG_LOCALE[locale],
            alternateLocale: routing.locales
              .filter((l) => l !== locale)
              .map((l) => OG_LOCALE[l]),
            title,
            description,
            url: getPathname({ href, locale }),
          },
        }
      : { robots: { index: false, follow: false } }),
    ...extra,
  };
}
