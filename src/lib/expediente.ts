import "server-only";
import { createHash, randomBytes } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * El enlace del expediente es la credencial: quien lo tiene, entra. Por eso
 * en la base sólo vive su SHA-256 — si se filtrara, los enlaces no serían
 * utilizables. Es el mismo criterio con el que se guarda una contraseña,
 * aplicado a un token de un solo destinatario.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** 32 bytes de aleatoriedad: no se adivina ni se recorre por fuerza bruta. */
export function nuevoToken(): string {
  return randomBytes(32).toString("base64url");
}

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
  if (!token || token.length < 20) return null;

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

  const expira = data.expediente_expira ? new Date(data.expediente_expira) : null;
  if (!expira || expira.getTime() < Date.now()) return null;

  return {
    applicationId: data.id,
    nombre: data.nombre,
    folio: data.folio,
    esMenor: Boolean(data.es_menor),
    tutorNombre: data.tutor_nombre ?? null,
    yaEnviado: Boolean(data.expediente_enviado_at),
  };
}
