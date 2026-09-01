import type { MetadataRoute } from "next";

import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/urls";

/**
 * Mientras el sitio sea una demo, no se indexa nada.
 *
 * El `sitemap.xml` lista las 44 URLs públicas, así que sin esto un buscador
 * que dé con la URL del preview indexaría el sitio entero con su contenido de
 * relleno: cifras de ejemplo, ocho productos inventados y tres documentos
 * legales que no son los definitivos. Sacar eso del índice después cuesta más
 * que no meterlo.
 *
 * **Al lanzar**, poner `SITIO_INDEXABLE=1` en las variables de entorno. No se
 * deduce de `NODE_ENV` a propósito: la demo también se construye en modo
 * producción, y eso la dejaría abierta.
 */
const INDEXABLE = process.env.SITIO_INDEXABLE === "1";

/**
 * Rutas que no tienen nada que hacer en un índice: áreas con sesión, el panel
 * y los enlaces personales con token. No son secretas —cada una se defiende
 * sola— pero no son contenido.
 *
 * Se bloquean en los dos idiomas, resueltas por el mapa de rutas y no escritas
 * a mano: `/en/account` no se parece a `/cuenta`, y una lista literal se
 * quedaría atrás en cuanto un slug cambiara de nombre.
 */
const PRIVADAS = [
  "/admin",
  "/cuenta",
  "/login",
  "/registro",
  "/recuperar",
  "/sistema",
  "/tienda/gracias",
] as const;

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const disallow = [
    ...PRIVADAS.flatMap((href) =>
      routing.locales.map((locale) => getPathname({ href, locale })),
    ),
    // Los enlaces con token son rutas dinámicas: se bloquea el prefijo entero.
    ...routing.locales.flatMap((locale) => [
      `${getPathname({ href: { pathname: "/expediente/[token]", params: { token: "x" } }, locale })}`.replace(/\/x$/, "/"),
      `${getPathname({ href: { pathname: "/tutor/[token]", params: { token: "x" } }, locale })}`.replace(/\/x$/, "/"),
    ]),
  ];

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
