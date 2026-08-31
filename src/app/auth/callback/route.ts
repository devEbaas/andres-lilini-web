import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
import { siteUrl } from "@/lib/urls";

// El SDK necesita el runtime de Node para escribir las cookies de sesión.
export const runtime = "nodejs";

/**
 * Punto de aterrizaje de los enlaces que Supabase manda por correo:
 * confirmación de cuenta y cambio de contraseña.
 *
 * El destino se arma con `siteUrl()` y no con el origen de la petición: un
 * `Host` falsificado convertiría este redirect en una fuga del código de
 * sesión hacia el dominio de quien lo falsifique.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"), "/cuenta");
  const base = siteUrl();

  const alFallo = `${base}/login?aviso=enlace`;
  if (!code) return NextResponse.redirect(alFallo);

  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.redirect(alFallo);

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Enlace caducado o ya usado. No se distingue: son de un solo uso.
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(alFallo);
  }

  return NextResponse.redirect(`${base}${next}`);
}
