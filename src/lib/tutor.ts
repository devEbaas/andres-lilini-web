import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { caducado, hashToken, tokenPlausible } from "@/lib/tokens";

export type VerificacionTutor = {
  applicationId: string;
  folio: string;
  jugador: string;
  tutorNombre: string | null;
  parentesco: string | null;
  yaVerificado: boolean;
};

/**
 * Resuelve el token de verificación del tutor, o `null`.
 *
 * Token inventado, caducado o de una postulación borrada devuelven lo
 * mismo: quien prueba enlaces al azar no debe poder deducir cuáles
 * existieron ni qué menores se postularon.
 */
export async function leerVerificacionTutor(
  token: string,
): Promise<VerificacionTutor | null> {
  if (!tokenPlausible(token)) return null;

  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("applications")
    .select("id, folio, nombre, tutor_nombre, tutor_parentesco, tutor_token_expira, tutor_verificado_at")
    .eq("tutor_token_hash", hashToken(token))
    .maybeSingle();

  if (error) {
    console.error("[leerVerificacionTutor]", error.message);
    return null;
  }
  if (!data) return null;
  if (caducado(data.tutor_token_expira)) return null;

  return {
    applicationId: data.id,
    folio: data.folio,
    jugador: data.nombre,
    tutorNombre: data.tutor_nombre ?? null,
    parentesco: data.tutor_parentesco ?? null,
    yaVerificado: Boolean(data.tutor_verificado_at),
  };
}
