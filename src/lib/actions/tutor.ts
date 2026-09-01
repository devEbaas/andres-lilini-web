"use server";

import { revalidatePath } from "next/cache";

import { adminOrNull } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { TUTOR_DIAS } from "@/lib/content/jugador";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaTutor } from "@/lib/email/plantillas";
import { leerVerificacionTutor } from "@/lib/tutor";
import { enDias, hashToken, nuevoToken } from "@/lib/tokens";
import { siteUrl } from "@/lib/urls";
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

/**
 * Reemite el enlace de autorización del tutor.
 *
 * Sin esto, una postulación de menor sin correo configurado se queda sin
 * salida: el token nace en `submitApplication`, sólo se guarda su hash y el
 * enlace viaja únicamente por correo. Si el envío no sale —o el tutor lo
 * pierde— no había forma de recuperarlo, y la postulación quedaba «Sin
 * verificar» para siempre.
 *
 * Mismo trato que el expediente: devuelve la URL **una sola vez** y el token
 * anterior deja de valer, que es lo que se quiere si acabó donde no debía.
 */
export async function reemitirEnlaceTutor(
  applicationId: string,
): Promise<ActionResult<{ url: string; expira: string; enviado: boolean }>> {
  const admin = await adminOrNull();
  if (!admin) return { ok: false, code: "noAutorizado" };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

  // Se lee antes de escribir: reemitir sobre una postulación ya autorizada
  // invalidaría una autorización válida, y sobre una de un mayor de edad no
  // significa nada.
  const { data: fila, error: errorLectura } = await supabase
    .from("applications")
    .select("id, folio, nombre, es_menor, tutor_email, tutor_verificado_at, locale")
    .eq("id", applicationId)
    .maybeSingle();

  if (errorLectura) {
    console.error("[reemitirEnlaceTutor] lectura", errorLectura.message);
    return { ok: false, code: GENERIC_ERROR };
  }
  if (!fila) return { ok: false, code: "noAutorizado" };
  if (!fila.es_menor || !fila.tutor_email) return { ok: false, code: "sinTutor" };
  if (fila.tutor_verificado_at) return { ok: false, code: "tutorYaAutorizo" };

  const token = nuevoToken();
  const expira = enDias(TUTOR_DIAS);

  const { error } = await supabase
    .from("applications")
    .update({ tutor_token_hash: hashToken(token), tutor_token_expira: expira.toISOString() })
    .eq("id", applicationId);

  if (error) {
    console.error("[reemitirEnlaceTutor]", error.message);
    return { ok: false, code: GENERIC_ERROR };
  }

  await logAdminAction(admin, {
    action: "tutor.reemision",
    targetTable: "applications",
    targetId: applicationId,
    // El token no se registra: dejaría en la auditoría la credencial que
    // toda esta función se molesta en no guardar.
    meta: { expira: expira.toISOString() },
  });

  const url = `${siteUrl()}/tutor/${token}`;

  // Se intenta mandar y se dice si salió. El enlace se devuelve igualmente:
  // sin correo configurado, el admin lo copia y lo hace llegar por donde
  // pueda, que es justo el caso que este botón viene a resolver.
  const enviado = await enviarCorreo({
    para: fila.tutor_email,
    // Bilingüe si la postulación no fue en español: quien autoriza es el
    // tutor, y no tiene por qué leer el idioma que eligió el jugador.
    ...(await plantillaTutor(
      { jugador: fila.nombre, folio: fila.folio, url, dias: TUTOR_DIAS },
      fila.locale,
    )),
  });

  revalidatePath("/admin/postulaciones");
  return { ok: true, data: { url, expira: expira.toISOString(), enviado } };
}
