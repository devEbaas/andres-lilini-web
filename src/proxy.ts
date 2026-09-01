import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth/redirect";
import { routing, RUTAS_SOLO_ES } from "@/i18n/routing";
import { rutaInterna, conIdioma } from "@/i18n/rutas";

// En Next 16 esto es `proxy.ts`: `middleware.ts` quedó deprecado y renombrado.
// Misma funcionalidad, distinto nombre de archivo y de export.

const AREAS_PRIVADAS = ["/admin", "/cuenta"];
const RUTAS_DE_ENTRADA = ["/login"];

const intl = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. next-intl resuelve el idioma y reescribe la URL a la ruta interna:
  //    `/tienda` → `/es/tienda`, `/en/store` → `/en/tienda`.
  const response = intl(request);

  // 2. La ruta que interesa para autorizar es la interna y sin prefijo, no la
  //    que escribió el navegador: `/en/account` y `/cuenta` son la misma área.
  const { pathname, search } = request.nextUrl;
  const { locale, interna } = rutaInterna(pathname);

  const empiezaPor = (bases: readonly string[]) =>
    bases.some((p) => interna === p || interna.startsWith(`${p}/`));

  // El panel y el sistema de diseño sólo existen en español, pero **existen**:
  // responder 404 sería mentir. Se redirige a la versión española.
  //
  // Importa porque el enlace «Panel» de la cabecera se renderiza en el idioma
  // que se esté usando: un admin que estuviera viendo el sitio en inglés
  // pulsaba y caía en un 404 sin más salida que editar la URL a mano.
  if (empiezaPor(RUTAS_SOLO_ES) && locale !== routing.defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = conIdioma(interna, routing.defaultLocale);
    return NextResponse.redirect(url);
  }

  const esPrivada = empiezaPor(AREAS_PRIVADAS);
  const esEntrada = RUTAS_DE_ENTRADA.includes(interna);

  // 3. Todo lo público sale por aquí sin tocar Supabase.
  //
  //    El matcher tuvo que abrirse a todas las rutas para que next-intl pueda
  //    reescribir, pero verificar un JWT en cada vista de producto es caro y no
  //    compra nada: el sitio es mayoritariamente estático y fuera del área
  //    privada la sesión la mantiene viva el cliente del navegador.
  if (!esPrivada && !esEntrada) return response;

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // Las cookies rotadas se copian SOBRE la respuesta de next-intl. Antes
        // aquí se hacía `NextResponse.next({ request })`, que ahora tiraría la
        // reescritura de idioma y dejaría `/en/account` sirviendo español.
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // No metas nada entre `createServerClient` y esta llamada. Cualquier lógica
  // en medio provoca cierres de sesión aleatorios, y son un infierno de
  // diagnosticar porque no fallan siempre.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  // Chequeo optimista: redirige, no autoriza. La frontera real son las
  // policies de RLS; esto sólo evita renderizar una pantalla vacía.
  if (esPrivada && !claims) {
    const url = request.nextUrl.clone();
    // El destino conserva el idioma: quien navegaba en inglés vuelve al login
    // en inglés, y `?next=` guarda la URL pública tal cual la escribió.
    url.pathname = conIdioma("/login", locale);
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (esEntrada && claims) {
    const url = request.nextUrl.clone();
    const destino = safeNext(request.nextUrl.searchParams.get("next"), conIdioma("/", locale));
    url.pathname = destino.split("?")[0];
    url.search = destino.includes("?") ? `?${destino.split("?")[1]}` : "";
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * El matcher cubre ahora todas las rutas de página, porque next-intl necesita
 * ver cada petición para resolver el idioma. El coste se controla dentro de la
 * función, no aquí: la verificación de JWT sigue detrás del chequeo de área
 * privada.
 *
 * Quedan fuera:
 * - `/api` y `/auth`, que son Route Handlers con URL fija. `/api/stripe/webhook`
 *   además no recibe cookies de Stripe y no queremos ni un redirect ni una
 *   cookie de más en esa respuesta.
 * - `_next` y `_vercel`, infraestructura del framework.
 * - Cualquier ruta con extensión (`favicon.ico`, `/images/logo-small.png`).
 */
export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
