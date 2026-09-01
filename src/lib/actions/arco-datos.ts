"use server";

import { adminOrNull } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { GENERIC_ERROR, isEmail, type ActionResult } from "./types";

const NO_AUTORIZADO = "noAutorizado";

export type Rastro = {
  postulaciones: { id: string; folio: string; nombre: string; created_at: string }[];
  convocatoria: { id: string; folio: string; nombre: string; created_at: string }[];
  mensajes: { id: string; topic: string; created_at: string }[];
  boletin: { id: string; created_at: string }[];
  pedidos: { id: string; total: number; status: string; created_at: string }[];
};

/**
 * Todo lo que hay de un correo, en las cinco tablas a la vez.
 *
 * Es la herramienta que hace ejecutable el derecho de acceso: cuatro de esas
 * tablas se llenaron desde formularios públicos y no saben de qué cuenta son,
 * así que el correo es la única forma de encontrarlas.
 *
 * Lee con el cliente autenticado, no con service role: las policies de admin
 * ya dan acceso y así una sesión que no sea admin no obtiene nada.
 */
export async function buscarPorCorreo(email: string): Promise<ActionResult<Rastro>> {
  if (!isEmail(email)) return { ok: false, code: "correoInvalido" };

  const admin = await adminOrNull();
  if (!admin) return { ok: false, code: NO_AUTORIZADO };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

  const e = email.trim().toLowerCase();

  const [postulaciones, convocatoria, mensajes, boletin, pedidos] = await Promise.all([
    supabase.from("applications").select("id, folio, nombre, created_at").ilike("email", e),
    supabase.from("convocatoria_entries").select("id, folio, nombre, created_at").ilike("email", e),
    supabase.from("contact_messages").select("id, topic, created_at").ilike("email", e),
    supabase.from("newsletter_subscribers").select("id, created_at").ilike("email", e),
    supabase.from("orders").select("id, total, status, created_at").ilike("email", e),
  ]);

  await logAdminAction(admin, {
    action: "arco.busqueda",
    meta: { email: e },
  });

  return {
    ok: true,
    data: {
      postulaciones: postulaciones.data ?? [],
      convocatoria: convocatoria.data ?? [],
      mensajes: mensajes.data ?? [],
      boletin: boletin.data ?? [],
      pedidos: pedidos.data ?? [],
    },
  };
}

/**
 * Ejecuta una cancelación: borra lo que se puede borrar y anonimiza lo que no.
 *
 * Necesita service role porque ninguna tabla tiene policy de delete —a
 * propósito, para que borrar nunca sea un accidente del panel—. La
 * autorización la da `adminOrNull()` y queda registrada en `admin_audit`.
 *
 * Los pedidos NO se borran: hay obligación fiscal de conservarlos. Se van el
 * correo y la dirección; se quedan importes, fechas y estado.
 */
export async function purgarPorCorreo(input: {
  email: string;
  confirmacion: string;
}): Promise<ActionResult<{ resumen: string }>> {
  if (!isEmail(input.email)) return { ok: false, code: "correoInvalido" };

  const e = input.email.trim().toLowerCase();
  if (input.confirmacion.trim().toLowerCase() !== e) {
    return { ok: false, code: "correoRepetir" };
  }

  const admin = await adminOrNull();
  if (!admin) return { ok: false, code: NO_AUTORIZADO };

  const service = createAdminClient();
  if (!service) return { ok: false, code: GENERIC_ERROR };

  // Los archivos primero: si se borran las filas antes, se pierde la ruta y
  // el archivo queda huérfano en el bucket para siempre. Es lo que más se
  // olvida, porque no aparece en ninguna tabla después.
  const { data: entradas } = await service
    .from("convocatoria_entries")
    .select("file_path")
    .ilike("email", e);

  const rutas = (entradas ?? [])
    .map((x) => x.file_path)
    .filter((x): x is string => Boolean(x));

  if (rutas.length) {
    const { error } = await service.storage.from("convocatoria").remove(rutas);
    if (error) console.error("[purgarPorCorreo] storage", error.message);
  }

  const conteo = { postulaciones: 0, convocatoria: 0, mensajes: 0, boletin: 0, pedidos: 0 };

  const borrar = async (tabla: "applications" | "convocatoria_entries" | "contact_messages" | "newsletter_subscribers") => {
    const { data, error } = await service.from(tabla).delete().ilike("email", e).select("id");
    if (error) {
      console.error("[purgarPorCorreo]", tabla, error.message);
      return 0;
    }
    return data?.length ?? 0;
  };

  conteo.postulaciones = await borrar("applications");
  conteo.convocatoria = await borrar("convocatoria_entries");
  conteo.mensajes = await borrar("contact_messages");
  conteo.boletin = await borrar("newsletter_subscribers");

  const { data: anon, error: errorAnon } = await service
    .from("orders")
    .update({ email: null, shipping_address: null })
    .ilike("email", e)
    .select("id");

  if (errorAnon) console.error("[purgarPorCorreo] orders", errorAnon.message);
  conteo.pedidos = anon?.length ?? 0;

  await logAdminAction(admin, {
    action: "arco.purga",
    meta: { email: e, ...conteo, archivos: rutas.length },
  });

  const resumen =
    `${conteo.postulaciones} postulaciones, ${conteo.convocatoria} participaciones ` +
    `(${rutas.length} archivos), ${conteo.mensajes} mensajes y ${conteo.boletin} altas de ` +
    `boletín borrados. ${conteo.pedidos} pedidos anonimizados.`;

  return { ok: true, data: { resumen } };
}
