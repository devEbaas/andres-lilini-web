"use server";

import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
import { conIdioma } from "@/i18n/rutas";
import { normalizaLocale, type ErrorRef } from "./types";

const CODIGO_MAL = "codigoMal";
const FALLO = "codigoNoVerificado";

/**
 * Completa el segundo factor de una sesión que ya pasó la contraseña.
 *
 * Va en el servidor y no en el navegador para que las cookies de la sesión
 * elevada a aal2 las escriba el mismo sitio que las escribió al entrar.
 */
export async function verificarMfa(input: {
  code: string;
  next?: string;
  /** Igual que en `signIn`: la acción no puede resolver el idioma sola. */
  locale?: string;
}): Promise<{ ok: false; code: ErrorRef }> {
  const code = input.code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, code: CODIGO_MAL };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, code: FALLO };

  const { data: factores, error: errorFactores } = await supabase.auth.mfa.listFactors();
  if (errorFactores) {
    console.error("[verificarMfa] listFactors", errorFactores.message);
    return { ok: false, code: FALLO };
  }

  const totp = factores?.totp?.[0];
  if (!totp) return { ok: false, code: FALLO };

  const { data: reto, error: errorReto } = await supabase.auth.mfa.challenge({
    factorId: totp.id,
  });
  if (errorReto || !reto) {
    console.error("[verificarMfa] challenge", errorReto?.message);
    return { ok: false, code: FALLO };
  }

  const { error: errorVerify } = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: reto.id,
    code,
  });
  if (errorVerify) {
    // Sin detalle al navegador: un código malo y uno caducado se responden
    // igual, como en el login.
    console.error("[verificarMfa] verify", errorVerify.message);
    return { ok: false, code: CODIGO_MAL };
  }

  const { data: verificado } = await supabase.auth.getClaims();
  const esAdmin = verificado?.claims?.user_role === "admin";

  // Igual que en `signIn`: la cookie con el token ya elevado a aal2 y la
  // navegación viajan en la misma respuesta. Era justo esta separación la
  // que hacía que el código se pidiera dos veces.
  const locale = normalizaLocale(input.locale);
  redirect(safeNext(input.next, esAdmin ? "/admin" : conIdioma("/", locale)));
}
