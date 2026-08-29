import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth/redirect";

// En Next 16 esto es `proxy.ts`: `middleware.ts` quedó deprecado y renombrado.
// Misma funcionalidad, distinto nombre de archivo y de export.

const AREAS_PRIVADAS = ["/admin", "/cuenta"];
const RUTAS_DE_ENTRADA = ["/login"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // Se rehace la respuesta para que arrastre las cookies rotadas. Si en
        // vez de esto se devolviera un NextResponse nuevo sin copiarlas, el
        // token refrescado se pierde y la sesión se cae sola cada hora.
        response = NextResponse.next({ request });
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

  const { pathname, search } = request.nextUrl;
  const esPrivada = AREAS_PRIVADAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const esEntrada = RUTAS_DE_ENTRADA.includes(pathname);

  // Chequeo optimista: redirige, no autoriza. La frontera real son las
  // policies de RLS; esto sólo evita renderizar una pantalla vacía.
  if (esPrivada && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (esEntrada && claims) {
    const url = request.nextUrl.clone();
    const destino = safeNext(request.nextUrl.searchParams.get("next"), "/");
    url.pathname = destino.split("?")[0];
    url.search = destino.includes("?") ? `?${destino.split("?")[1]}` : "";
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * El matcher se limita a las zonas con sesión.
 *
 * La recomendación genérica de Supabase es correr en todas las rutas para que
 * el token se refresque siempre, pero este sitio es mayoritariamente estático:
 * pagar una verificación de JWT en cada vista de producto es caro y no compra
 * nada. Dentro del área privada se refresca en cada navegación, y fuera lo
 * mantiene vivo el cliente del navegador.
 *
 * `/api/stripe/webhook` queda fuera a propósito: Stripe no manda cookies y no
 * queremos ni un redirect ni una cookie de más en esa respuesta.
 */
export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/login", "/auth/:path*"],
};
