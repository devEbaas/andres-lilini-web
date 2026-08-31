import "server-only";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

export type SessionClaims = {
  userId: string;
  email: string | null;
  role: AppRole;
  isActive: boolean;
  /** Nivel de garantía del propio JWT: "aal1" con contraseña, "aal2" con MFA. */
  aal: string | null;
};

/**
 * Lee la sesión verificando la firma del JWT.
 *
 * `getClaims()` y no `getSession()`: el segundo devuelve lo que haya en la
 * cookie sin comprobar nada. El propio SDK lo advierte —«the user object
 * returned by this function must not be trusted»— y una cookie es
 * exactamente el medio inseguro del que habla.
 */
export async function getClaims(): Promise<SessionClaims | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const claims = data.claims;
  const role = claims.user_role === "admin" ? "admin" : "cliente";

  return {
    userId: String(claims.sub),
    email: typeof claims.email === "string" ? claims.email : null,
    role,
    isActive: claims.is_active === true,
    aal: typeof claims.aal === "string" ? claims.aal : null,
  };
}

/**
 * ¿La sesión pasó la contraseña pero le falta el segundo factor?
 *
 * `nextLevel` es aal2 sólo si la cuenta tiene un factor verificado. Si nunca
 * se enroló, nextLevel es aal1 y esto devuelve false: no se fuerza el enrolado
 * para no dejar a nadie fuera del panel de golpe. El empujón lo da el aviso de
 * `/admin`, y hacerlo obligatorio es cambiar esta condición.
 */
export async function mfaPendiente(): Promise<boolean> {
  const supabase = await createServerSupabase();
  if (!supabase) return false;

  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.nextLevel === "aal2" && data.currentLevel !== "aal2";
}

/** ¿La cuenta tiene ya un segundo factor verificado? */
export async function tieneMfa(): Promise<boolean> {
  const supabase = await createServerSupabase();
  if (!supabase) return false;

  const { data } = await supabase.auth.mfa.listFactors();
  return Boolean(data?.totp?.length);
}

/** Exige sesión activa y con el segundo factor resuelto, si lo hay. */
export async function requireUser(next: string): Promise<SessionClaims> {
  const claims = await getClaims();
  if (!claims || !claims.isActive) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // Si el propio JWT ya dice aal2, el segundo factor está resuelto y no hay
  // nada que preguntar. Es el atajo que evita el doble código: `getClaims()`
  // acaba de verificar la firma de ese token, mientras que
  // `getAuthenticatorAssuranceLevel()` vuelve a leer la sesión y puede ver
  // todavía la anterior en la primera navegación tras verificar.
  if (claims.aal === "aal2") return claims;

  // Una sesión a medio autenticar no vale como sesión.
  if (await mfaPendiente()) {
    redirect(`/login/mfa?next=${encodeURIComponent(next)}`);
  }

  return claims;
}

/**
 * Exige rol admin.
 *
 * Esto es defensa en profundidad, no la frontera: las policies de RLS ya
 * niegan las filas a quien no sea admin. Si esta comprobación fallara, el
 * panel se vería vacío en vez de filtrar datos.
 */
export async function requireAdmin(next: string): Promise<SessionClaims> {
  const claims = await requireUser(next);
  if (claims.role !== "admin") redirect("/");
  return claims;
}

/**
 * Variante para Server Actions: devuelve `null` en vez de redirigir.
 *
 * Una acción tiene que responder con un error, no navegar. Aun así esto es
 * la segunda capa: la escritura va con el cliente autenticado, así que la
 * policy de RLS es la que decide de verdad.
 */
export async function adminOrNull(): Promise<SessionClaims | null> {
  const claims = await getClaims();
  if (!claims || !claims.isActive || claims.role !== "admin") return null;
  return claims;
}
