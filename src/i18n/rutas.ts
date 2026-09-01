import { routing, type Locale } from "./routing";

/**
 * Traducción de rutas sin React.
 *
 * `createNavigation` cubre los componentes, pero el proxy corre en el runtime
 * de Edge y la capa de datos en el servidor: ninguno de los dos puede montar el
 * `Link` de next-intl. Estas dos funciones hacen el ida y vuelta contra el
 * mismo mapa de `routing.ts`, que sigue siendo la única fuente de verdad.
 */

const PATHNAMES = routing.pathnames as Record<string, string | Record<Locale, string>>;

const esLocale = (v: string): v is Locale => (routing.locales as readonly string[]).includes(v);

/** La forma que ve el navegador, todavía sin prefijo de idioma. */
function externa(interna: string, locale: Locale): string {
  const valor = PATHNAMES[interna];
  if (!valor) return interna;
  return typeof valor === "string" ? valor : valor[locale];
}

/** `/tienda/[id]` → `/^\/store\/[^/]+$/` para el idioma pedido. */
function aRegex(patron: string): RegExp {
  const cuerpo = patron
    .split("/")
    .map((seg) =>
      seg.startsWith("[") && seg.endsWith("]")
        ? "[^/]+"
        : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("/");
  return new RegExp(`^${cuerpo}$`);
}

// Las rutas literales se prueban antes que las dinámicas: si no, `/tienda/[id]`
// se quedaría con `/tienda/gracias`.
const CLAVES = Object.keys(PATHNAMES).sort((a, b) => {
  const dinamica = (s: string) => (s.includes("[") ? 1 : 0);
  return dinamica(a) - dinamica(b);
});

/**
 * De la URL del navegador a la ruta interna y el idioma.
 *
 * `/en/store/p3` → `{ locale: "en", interna: "/tienda/[id]" }`
 * `/cuenta/pedidos` → `{ locale: "es", interna: "/cuenta/pedidos" }`
 *
 * Devuelve el patrón, no la ruta con los parámetros sustituidos: quien llama
 * quiere saber *qué* ruta es para decidir permisos, no reconstruir la URL.
 * Una ruta desconocida vuelve tal cual, sin prefijo.
 */
export function rutaInterna(pathname: string): { locale: Locale; interna: string } {
  const [, primero = "", ...resto] = pathname.split("/");
  const conPrefijo = esLocale(primero);
  const locale: Locale = conPrefijo ? primero : routing.defaultLocale;

  const sinPrefijo = conPrefijo ? `/${resto.join("/")}` : pathname;
  const limpio = sinPrefijo === "/" || sinPrefijo === "" ? "/" : sinPrefijo.replace(/\/$/, "");

  for (const interna of CLAVES) {
    if (aRegex(externa(interna, locale)).test(limpio)) return { locale, interna };
  }
  return { locale, interna: limpio };
}

/**
 * De la ruta interna a la URL del navegador, con prefijo si toca.
 *
 * `conIdioma("/cuenta", "en")` → `/en/account`
 * `conIdioma("/cuenta", "es")` → `/cuenta`
 */
export function conIdioma(interna: string, locale: Locale): string {
  const path = externa(interna, locale);
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
