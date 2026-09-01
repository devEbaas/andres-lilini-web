"use server";

import { revalidatePath } from "next/cache";

import { adminOrNull } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/auth/audit";
import { rutaCon } from "@/i18n/rutas";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALCANCES_IMAGEN,
  EXPEDIENTE_DIAS,
  PARENTESCOS,
  PROTOCOLOS,
  SEGUROS,
  TESTS_AGILIDAD,
} from "@/lib/content/jugador";
import { leerInvitacion } from "@/lib/expediente";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaExpediente } from "@/lib/email/plantillas";
import { enDias, hashToken, nuevoToken } from "@/lib/tokens";
import { siteUrl } from "@/lib/urls";
import { GENERIC_ERROR, type ActionResult, type ErrorRef } from "./types";

const NO_AUTORIZADO = "noAutorizado";
const ENLACE_MALO = "enlaceInvalido";

/**
 * Crea el enlace privado de un preseleccionado.
 *
 * Devuelve la URL completa **una sola vez**: en la base sólo queda el hash,
 * así que no hay forma de volver a mostrarla. Si se pierde, se regenera —
 * y al regenerarla el enlace anterior deja de funcionar, que es justo lo
 * que se quiere si se perdió por donde no debía.
 */
export async function generarEnlaceExpediente(
  applicationId: string,
): Promise<ActionResult<{ url: string; expira: string; enviado: boolean }>> {
  const admin = await adminOrNull();
  if (!admin) return { ok: false, code: NO_AUTORIZADO };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

  const token = nuevoToken();
  const expira = enDias(EXPEDIENTE_DIAS);

  const { data, error } = await supabase
    .from("applications")
    .update({
      expediente_token_hash: hashToken(token),
      expediente_expira: expira.toISOString(),
      // Un enlace nuevo reabre el expediente: si se regenera es porque hay
      // algo que corregir o completar.
      expediente_enviado_at: null,
    })
    .eq("id", applicationId)
    .select("id, nombre, email, folio, locale")
    .maybeSingle();

  if (error) {
    console.error("[generarEnlaceExpediente]", error.message);
    return { ok: false, code: GENERIC_ERROR };
  }
  if (!data) return { ok: false, code: NO_AUTORIZADO };

  await logAdminAction(admin, {
    action: "expediente.invitacion",
    targetTable: "applications",
    targetId: applicationId,
    // El token no se registra: dejaría en la auditoría la credencial que
    // toda esta función se molesta en no guardar.
    meta: { expira: expira.toISOString() },
  });

  // El idioma que guardó la postulación, como el correo que lo lleva.
  const url = `${siteUrl()}${rutaCon("/expediente/[token]", data.locale, { token })}`;

  // Se intenta mandar y se dice si salió. El enlace se devuelve igualmente:
  // sin correo configurado —o si el envío falla— el admin lo copia y lo
  // manda por donde pueda, que es como funcionaba hasta ahora.
  const enviado = await enviarCorreo({
    para: data.email,
    // El idioma es el que guardó la postulación, no el del admin que pulsa
    // el botón: quien lee el correo es el jugador.
    ...(await plantillaExpediente(
      {
        jugador: data.nombre.split(" ")[0],
        folio: data.folio,
        url,
        dias: EXPEDIENTE_DIAS,
      },
      data.locale,
    )),
  });

  revalidatePath("/admin/postulaciones");
  return { ok: true, data: { url, expira: expira.toISOString(), enviado } };
}

export type ExpedientePayload = {
  sprint10: string;
  sprint30: string;
  saltoCmj: string;
  agilidadTest: string;
  agilidadSeg: string;
  yoyo: string;
  protocolo: string;
  medidoEn: string;
  contactoNombre: string;
  contactoParentesco: string;
  contactoTel: string;
  alergias: string;
  condiciones: string;
  lesiones: string;
  seguro: string;
  okSalud: boolean;
  okImagen: boolean;
  imagenAlcance: string;
  firmanteNombre: string;
};

/** Decimal o null. El formulario manda cadenas y "" no es cero. */
function dec(v: string): number | null {
  const limpio = v.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  return Number(limpio);
}

function ent(v: string): number | null {
  return /^\d+$/.test(v.trim()) ? Number(v.trim()) : null;
}

export async function enviarExpediente(
  token: string,
  input: ExpedientePayload,
): Promise<ActionResult<{ folio: string }>> {
  // La autorización es el token y se vuelve a comprobar aquí: la página que
  // lo mostró no decide nada, y nadie manda el id de la postulación desde
  // el navegador.
  const invitacion = await leerInvitacion(token);
  if (!invitacion) return { ok: false, code: ENLACE_MALO };
  if (invitacion.yaEnviado) {
    return { ok: false, code: "expedienteEnviadoPideEnlace" };
  }

  const fieldErrors: Record<string, ErrorRef> = {};
  const t = (v: string) => v.trim();

  if (!t(input.contactoNombre)) fieldErrors.contactoNombre = "contactoEmergencia";
  if (!PARENTESCOS.includes(input.contactoParentesco) && !t(input.contactoParentesco)) {
    fieldErrors.contactoParentesco = "indicaParentesco";
  }
  if (!t(input.contactoTel)) fieldErrors.contactoTel = "telefonoNecesario";

  if (input.protocolo && !PROTOCOLOS.includes(input.protocolo)) {
    fieldErrors.protocolo = "eligeProtocolo";
  }
  if (input.agilidadTest && !TESTS_AGILIDAD.includes(input.agilidadTest)) {
    fieldErrors.agilidadTest = "eligeTest";
  }
  if (input.seguro && !SEGUROS.includes(input.seguro)) {
    fieldErrors.seguro = "eligeOpcion";
  }
  if (input.imagenAlcance && !ALCANCES_IMAGEN.includes(input.imagenAlcance)) {
    fieldErrors.imagenAlcance = "eligeAlcance";
  }

  // Si hay algo escrito en salud, hace falta el consentimiento expreso: son
  // datos sensibles. Y si no lo hay, tampoco se guardan.
  const haySalud = Boolean(
    t(input.alergias) || t(input.condiciones) || t(input.lesiones) || t(input.seguro),
  );
  if (haySalud && !input.okSalud) {
    fieldErrors.okSalud = "consentimientoSalud";
  }

  if (input.okImagen && !input.imagenAlcance) {
    fieldErrors.imagenAlcance = "indicaAlcance";
  }

  // En un menor, quien firma es el tutor: no se acepta la autofirma.
  if (!t(input.firmanteNombre)) {
    fieldErrors.firmanteNombre = invitacion.esMenor ? "firmanteTutor" : "firmantePropio";
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, code: "revisaCampos", fieldErrors };
  }

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

  const { error } = await supabase.from("expedientes").insert({
    application_id: invitacion.applicationId,
    sprint_10: dec(input.sprint10),
    sprint_30: dec(input.sprint30),
    salto_cmj: ent(input.saltoCmj),
    agilidad_test: input.agilidadTest || null,
    agilidad_seg: dec(input.agilidadSeg),
    yoyo: t(input.yoyo) || null,
    protocolo: input.protocolo || null,
    medido_en: input.medidoEn || null,
    contacto_nombre: t(input.contactoNombre),
    contacto_parentesco: t(input.contactoParentesco),
    contacto_tel: t(input.contactoTel),
    // Sin consentimiento no se guarda ni una línea de salud, aunque venga
    // escrita: el CHECK de la base dice lo mismo.
    alergias: input.okSalud ? t(input.alergias) || null : null,
    condiciones: input.okSalud ? t(input.condiciones) || null : null,
    lesiones: input.okSalud ? t(input.lesiones) || null : null,
    seguro: input.okSalud ? input.seguro || null : null,
    ok_salud: input.okSalud,
    ok_imagen: input.okImagen,
    imagen_alcance: input.okImagen ? input.imagenAlcance : null,
    firmante: invitacion.esMenor ? "Tutor" : "Titular",
    firmante_nombre: t(input.firmanteNombre),
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, code: "expedienteEnviado" };
    }
    console.error("[enviarExpediente]", error.message);
    return { ok: false, code: GENERIC_ERROR };
  }

  await supabase
    .from("applications")
    .update({ expediente_enviado_at: new Date().toISOString() })
    .eq("id", invitacion.applicationId);

  revalidatePath("/admin/expedientes");
  return { ok: true, data: { folio: invitacion.folio } };
}
