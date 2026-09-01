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
 * De una URL a la ruta interna y el idioma.
 *
 * `/en/store/p3` → `{ locale: "en", interna: "/tienda/[id]" }`
 * `/cuenta/pedidos` → `{ locale: "es", interna: "/cuenta/pedidos" }`
 *
 * Devuelve el patrón, no la ruta con los parámetros sustituidos: quien llama
 * quiere saber *qué* ruta es para decidir permisos o reconstruirla en el otro
 * idioma, no repetir la que ya tiene.
 *
 * Acepta las dos formas que circulan por el sistema. El proxy la llama con lo
 * que escribió el navegador —`/en/store/p3`— y corre antes de reescribir nada.
 * El selector de idioma la llama con lo que devuelve `usePathname()`, que en
 * el render del servidor ya viene reescrito —`/en/tienda/p3`—. Probar sólo una
 * de las dos deja la otra cayendo al camino de «ruta desconocida», y ahí se
 * pierden los parámetros.
 *
 * Una ruta que no case con ninguna vuelve tal cual, sin prefijo.
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
  // Segunda pasada contra la forma interna, para la ruta ya reescrita.
  for (const interna of CLAVES) {
    if (aRegex(interna).test(limpio)) return { locale, interna };
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

/**
 * Igual, pero sustituyendo los parámetros de una ruta dinámica.
 *
 * `rutaCon("/tutor/[token]", "en", { token: "abc" })` → `/en/guardian/abc`
 *
 * Existe para lo que sale del sitio: las URLs de vuelta de Stripe, los enlaces
 * de los correos y los `redirectTo` de Supabase. Todas ellas se escribían a
 * mano en español, así que quien compraba o se registraba en inglés volvía al
 * sitio en español sin haber pedido el cambio.
 */
export function rutaCon(
  interna: string,
  locale: Locale,
  params: Record<string, string> = {},
): string {
  let ruta = conIdioma(interna, locale);
  for (const [clave, valor] of Object.entries(params)) {
    ruta = ruta.replace(`[${clave}]`, encodeURIComponent(valor));
  }
  return ruta;
}
