import type { MetadataRoute } from "next";

import { DOC_SLUGS } from "@/lib/content/docs";
import { getProductIds } from "@/lib/data/products";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/urls";

type Destino = Parameters<typeof getPathname>[0]["href"];

/**
 * Rutas públicas e indexables.
 *
 * Queda fuera lo que no debe aparecer en un buscador: acceso, cuenta, panel,
 * confirmación de pedido y los enlaces con token, que son personales y
 * caducan. `/sistema` tampoco: es documentación interna.
 */
const ESTATICAS: Destino[] = [
  "/",
  "/tienda",
  "/programa",
  "/convocatoria",
  "/fundacion",
  "/contacto",
  "/derechos",
  "/registro",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const destinos: Destino[] = [
    ...ESTATICAS,
    ...DOC_SLUGS.map((doc) => ({ pathname: "/contenido/[doc]" as const, params: { doc } })),
    ...(await getProductIds()).map((id) => ({
      pathname: "/tienda/[id]" as const,
      params: { id },
    })),
  ];

  // Una entrada por ruta e idioma, cada una declarando dónde está la otra.
  // Los slugs salen del mapa de rutas, no concatenados a mano: si mañana
  // `/en/store` pasa a llamarse de otra forma, el sitemap se entera solo.
  return destinos.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: `${base}${getPathname({ href, locale })}`,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}${getPathname({ href, locale: l })}`]),
        ),
      },
    })),
  );
}
