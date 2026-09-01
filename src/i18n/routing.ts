import { defineRouting } from "next-intl/routing";

/**
 * Mapa de rutas bilingüe.
 *
 * `localePrefix: "as-needed"` deja el español en la raíz —`/tienda` sigue
 * siendo `/tienda`— y prefija sólo el inglés. Ninguna URL indexada cambia.
 *
 * `localeDetection: false` a propósito: el idioma lo elige la persona con el
 * selector, no el `Accept-Language`. Así una misma URL sirve siempre el mismo
 * contenido, que es lo que hace cacheable un sitio mayoritariamente estático.
 *
 * Las claves son las rutas internas —las carpetas reales bajo `app/[lang]/`—
 * y los valores, lo que ve el navegador en cada idioma.
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",

    // Público
    "/tienda": { es: "/tienda", en: "/store" },
    "/tienda/[id]": { es: "/tienda/[id]", en: "/store/[id]" },
    "/tienda/gracias": { es: "/tienda/gracias", en: "/store/thank-you" },
    "/programa": { es: "/programa", en: "/program" },
    "/convocatoria": { es: "/convocatoria", en: "/tryouts" },
    "/fundacion": { es: "/fundacion", en: "/foundation" },
    "/contacto": { es: "/contacto", en: "/contact" },
    "/contenido/[doc]": { es: "/contenido/[doc]", en: "/content/[doc]" },

    // Sesión y cuenta
    "/login": "/login",
    "/login/mfa": "/login/mfa",
    "/registro": { es: "/registro", en: "/signup" },
    "/recuperar": { es: "/recuperar", en: "/reset-password" },
    "/cuenta": { es: "/cuenta", en: "/account" },
    "/cuenta/password": { es: "/cuenta/password", en: "/account/password" },
    "/cuenta/pedidos": { es: "/cuenta/pedidos", en: "/account/orders" },
    "/cuenta/privacidad": { es: "/cuenta/privacidad", en: "/account/privacy" },

    // Privacidad y enlaces con token
    "/derechos": { es: "/derechos", en: "/privacy-rights" },
    "/expediente/[token]": { es: "/expediente/[token]", en: "/dossier/[token]" },
    "/tutor/[token]": { es: "/tutor/[token]", en: "/guardian/[token]" },

    // Internas: sólo español. Están en el mapa para que `Link` las acepte,
    // pero su layout responde 404 si el idioma no es español.
    "/sistema": "/sistema",
    "/admin": "/admin",
    "/admin/arco": "/admin/arco",
    "/admin/boletin": "/admin/boletin",
    "/admin/convocatoria": "/admin/convocatoria",
    "/admin/expedientes": "/admin/expedientes",
    "/admin/mensajes": "/admin/mensajes",
    "/admin/pedidos": "/admin/pedidos",
    "/admin/postulaciones": "/admin/postulaciones",
    "/admin/seguridad": "/admin/seguridad",
  },
});

export type Locale = (typeof routing.locales)[number];

/** Cualquier ruta interna: las claves del mapa de arriba. */
export type Ruta = keyof (typeof routing)["pathnames"];

/** Las rutas sin parámetros, que es lo que cabe en una lista de enlaces. */
export type RutaEstatica = Exclude<Ruta, `${string}[${string}`>;

/**
 * Lo que puede llevar un `href` declarado en la capa de contenido: la ruta
 * sola o la ruta con ancla.
 *
 * Las rutas con parámetros —`/tienda/[id]`, `/contenido/[doc]`— se escriben en
 * el sitio de uso con la forma `{ pathname, params }`, porque el tipo de `Link`
 * comprueba que estén todos.
 */
export type Destino = RutaEstatica | { pathname: RutaEstatica; hash: string };

/** Rutas que sólo existen en español. Su layout hace `notFound()` en inglés. */
export const RUTAS_SOLO_ES = ["/admin", "/sistema"] as const;
