import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { caducado, hashToken, tokenPlausible } from "@/lib/tokens";

export type Invitacion = {
  applicationId: string;
  nombre: string;
  folio: string;
  esMenor: boolean;
  tutorNombre: string | null;
  yaEnviado: boolean;
};

/**
 * Resuelve un token a la postulación que invita, o `null`.
 *
 * Devuelve lo mismo para un token inventado, uno caducado y uno de una
 * postulación borrada: quien prueba enlaces al azar no debe poder deducir
 * cuáles existieron.
 */
export async function leerInvitacion(token: string): Promise<Invitacion | null> {
  if (!tokenPlausible(token)) return null;

  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("applications")
    .select("id, folio, nombre, es_menor, tutor_nombre, expediente_expira, expediente_enviado_at")
    .eq("expediente_token_hash", hashToken(token))
    .maybeSingle();

  if (error) {
    console.error("[leerInvitacion]", error.message);
    return null;
  }
  if (!data) return null;

  if (caducado(data.expediente_expira)) return null;

  return {
    applicationId: data.id,
    nombre: data.nombre,
    folio: data.folio,
    esMenor: Boolean(data.es_menor),
    tutorNombre: data.tutor_nombre ?? null,
    yaEnviado: Boolean(data.expediente_enviado_at),
  };
}
