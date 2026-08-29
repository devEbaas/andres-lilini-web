"use server";

import { revalidatePath } from "next/cache";

import { adminOrNull } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/supabase/types";
import { type ActionResult } from "./types";

const NO_AUTORIZADO = "Tu sesión no permite esta acción.";
const FALLO = "No pudimos guardar el cambio. Inténtalo de nuevo.";

const ESTADOS: ApplicationStatus[] = [
  "recibida",
  "en_revision",
  "preseleccionada",
  "aceptada",
  "descartada",
];

/**
 * Cambia el estado de una postulación.
 *
 * La escritura va con el cliente autenticado, no con service role: la policy
 * «admin actualiza postulaciones» es la que autoriza de verdad. El
 * `adminOrNull()` de arriba sólo sirve para devolver un error legible en vez
 * de un update que afecta a cero filas.
 */
export async function setEstadoPostulacion(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  if (!ESTADOS.includes(status)) return { ok: false, error: FALLO };

  const admin = await adminOrNull();
  if (!admin) return { ok: false, error: NO_AUTORIZADO };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: FALLO };

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[setEstadoPostulacion]", error.message);
    return { ok: false, error: FALLO };
  }
  // Sin fila afectada: o no existe, o RLS la ocultó. No distinguimos.
  if (!data) return { ok: false, error: NO_AUTORIZADO };

  await logAdminAction(admin, {
    action: "postulacion.estado",
    targetTable: "applications",
    targetId: id,
    meta: { status },
  });

  revalidatePath("/admin/postulaciones");
  return { ok: true };
}

/** Marca un mensaje de contacto como atendido o pendiente. */
export async function marcarMensaje(id: string, handled: boolean): Promise<ActionResult> {
  const admin = await adminOrNull();
  if (!admin) return { ok: false, error: NO_AUTORIZADO };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: FALLO };

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ handled })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[marcarMensaje]", error.message);
    return { ok: false, error: FALLO };
  }
  if (!data) return { ok: false, error: NO_AUTORIZADO };

  await logAdminAction(admin, {
    action: handled ? "mensaje.atendido" : "mensaje.reabierto",
    targetTable: "contact_messages",
    targetId: id,
  });

  revalidatePath("/admin/mensajes");
  return { ok: true };
}

/** Segundos que vive el enlace firmado. Corto a propósito: ver abajo. */
const TTL_FIRMA = 60;

/**
 * Devuelve un enlace temporal al archivo de una participación.
 *
 * El orden importa y es lo que autoriza: primero se lee la fila con el
 * cliente autenticado, así que si RLS no la entrega no se llega a firmar
 * nada. La firma en sí necesita service role porque el bucket es privado y
 * no tiene policies de storage.
 *
 * El TTL es de un minuto porque una URL firmada es un token al portador con
 * vida propia: sigue siendo válida aunque cierres sesión, y si se reenvía,
 * funciona para quien la reciba.
 */
export async function urlArchivoConvocatoria(
  entryId: string,
): Promise<ActionResult<{ url: string }>> {
  const admin = await adminOrNull();
  if (!admin) return { ok: false, error: NO_AUTORIZADO };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: FALLO };

  const { data: fila, error: errorFila } = await supabase
    .from("convocatoria_entries")
    .select("id, folio, file_path, file_name")
    .eq("id", entryId)
    .maybeSingle();

  if (errorFila) {
    console.error("[urlArchivoConvocatoria]", errorFila.message);
    return { ok: false, error: FALLO };
  }
  if (!fila) return { ok: false, error: NO_AUTORIZADO };
  if (!fila.file_path) return { ok: false, error: "Esta participación no tiene archivo." };

  const service = createAdminClient();
  if (!service) return { ok: false, error: FALLO };

  const { data, error } = await service.storage
    .from("convocatoria")
    // `download` fuerza Content-Disposition: attachment, así el navegador lo
    // guarda en vez de abrirlo y no se pierde la página del panel.
    .createSignedUrl(fila.file_path, TTL_FIRMA, { download: fila.file_name ?? true });

  if (error || !data?.signedUrl) {
    console.error("[urlArchivoConvocatoria] firma", error?.message);
    return { ok: false, error: FALLO };
  }

  await logAdminAction(admin, {
    action: "convocatoria.descarga",
    targetTable: "convocatoria_entries",
    targetId: entryId,
    meta: { folio: fila.folio, path: fila.file_path, ttl: TTL_FIRMA },
  });

  return { ok: true, data: { url: data.signedUrl } };
}
