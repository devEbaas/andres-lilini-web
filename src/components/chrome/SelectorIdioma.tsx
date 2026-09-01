"use client";

import { useParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { getPathname } from "@/i18n/navigation";
import { RUTAS_SOLO_ES, routing, type Locale } from "@/i18n/routing";
import { rutaInterna } from "@/i18n/rutas";

const ROTULO: Record<Locale, string> = { es: "ES", en: "EN" };

/**
 * Cambia de idioma sin salir de la página.
 *
 * La ruta interna sale de `rutaInterna`, no del `usePathname` de next-intl:
 * ese devuelve la plantilla —`/tienda/[id]`— en español pero la ruta ya
 * resuelta —`/tienda/p3`— en inglés, y con la segunda forma `getPathname` no
 * traduce el slug. El nuestro devuelve siempre la plantilla, así que desde
 * `/tienda/p3` se va a `/en/store/p3` y no a la portada.
 *
 * Son enlaces y no botones a propósito: cada idioma tiene su URL, y eso hace
 * que se puedan abrir en otra pestaña, compartir e indexar.
 *
 * La URL se calcula con `getPathname` y se pinta como `<a>` en lugar de usar
 * `Link` con la prop `locale`. Esa vía deja el enlace del idioma activo sin
 * traducir —`/en/tienda/p3`— y prefija el español —`/es/…`—, dos formas que
 * funcionan sólo porque el proxy las redirige. Aquí sale la URL canónica a la
 * primera. Cambiar de idioma recarga la página, que es lo correcto: cambia el
 * documento entero, empezando por su `lang`.
 */
export function SelectorIdioma() {
  const activo = useLocale();
  const { interna } = rutaInterna(usePathname());
  const params = useParams();
  const t = useTranslations("common");

  // El panel y el sistema de diseño sólo existen en español: ofrecer el
  // cambio ahí llevaría a un 404.
  const soloEs = RUTAS_SOLO_ES.some((p) => interna === p || interna.startsWith(`${p}/`));
  if (soloEs) return null;

  return (
    <nav
      aria-label={t("switchLanguage")}
      className="flex overflow-hidden rounded-full border border-hairline"
    >
      {routing.locales.map((l) => {
        const actual = l === activo;
        const destino = getPathname({ href: { pathname: interna, params } as never, locale: l });
        return (
          <a
            key={l}
            /* `pathname` es la plantilla y `params` la completa. El tipo pide
               los parámetros sólo en las rutas que los tienen, y aquí la ruta
               se conoce en ejecución: el cast es el precio de un selector
               genérico que sirve para las veintidós. */
            href={destino}
            /* La query no se puede leer al renderizar sin arrastrar toda la
               página a dinámica, así que se añade al pulsar. Importa en
               `/login?next=…`: cambiar de idioma ahí no debe perder a dónde
               iba la persona. */
            onClick={(e) => {
              const query = window.location.search;
              if (!query) return;
              e.preventDefault();
              window.location.assign(destino + query);
            }}
            hrefLang={l}
            lang={l}
            aria-current={actual ? "true" : undefined}
            aria-label={t(`idiomas.${l}`)}
            className={`cursor-pointer px-[11px] py-2 text-[10px] font-extrabold tracking-[0.14em] ${
              actual ? "bg-panel-2 text-ink" : "bg-transparent text-muted hover:text-ink"
            }`}
          >
            {ROTULO[l]}
          </a>
        );
      })}
    </nav>
  );
}
