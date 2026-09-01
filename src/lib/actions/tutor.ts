"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { leerVerificacionTutor } from "@/lib/tutor";
import { hashToken } from "@/lib/tokens";
import { GENERIC_ERROR, type ActionResult } from "./types";

/**
 * El tutor confirma la postulación de su hijo o pupilo.
 *
 * La autorización es el token y se vuelve a resolver aquí: la página que
 * mostró el botón no decide nada, y el id de la postulación nunca viaja
 * desde el navegador.
 *
 * Al verificar se quema el token. La confirmación es un acto único: dejarlo
 * vivo permitiría reconfirmar indefinidamente desde un correo reenviado.
 */
export async function confirmarTutor(token: string): Promise<ActionResult> {
  const verificacion = await leerVerificacionTutor(token);
  if (!verificacion) {
    return { ok: false, code: "enlaceInvalido" };
  }
  if (verificacion.yaVerificado) return { ok: true };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

  const { error } = await supabase
    .from("applications")
    .update({
      tutor_verificado_at: new Date().toISOString(),
      tutor_token_hash: null,
      tutor_token_expira: null,
    })
    // Se filtra otra vez por el hash y no sólo por el id: si entre la
    // lectura y la escritura el token cambió, esta actualización no afecta
    // a ninguna fila en vez de escribir sobre un estado que ya no existe.
    .eq("tutor_token_hash", hashToken(token))
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[confirmarTutor]", error.message);
    return { ok: false, code: GENERIC_ERROR };
  }

  revalidatePath("/admin/postulaciones");
  return { ok: true };
}
