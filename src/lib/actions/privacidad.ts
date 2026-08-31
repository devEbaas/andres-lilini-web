"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

import { adminOrNull, getClaims } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaArco } from "@/lib/email/plantillas";
import type { ArcoStatus, ArcoTipo } from "@/lib/supabase/types";
import { GENERIC_ERROR, isEmail, type ActionResult } from "./types";

const NO_SESION = "Tu sesión ha caducado. Vuelve a entrar.";
const NO_AUTORIZADO = "Tu sesión no permite esta acción.";

const TIPOS: ArcoTipo[] = ["acceso", "rectificacion", "cancelacion", "oposicion"];
const ESTADOS: ArcoStatus[] = ["recibida", "en_proceso", "atendida", "rechazada"];

/* ── Derecho de acceso ──────────────────────────────────────── */

/**
 * Todo lo que guardamos de esta cuenta, en JSON.
 *
 * Lee con el cliente autenticado: las policies deciden qué filas existen,
 * así que no hay forma de que devuelva datos de otra persona aunque el
 * código se equivoque.
 */
export async function exportarMisDatos(): Promise<ActionResult<{ json: string }>> {
  const claims = await getClaims();
  if (!claims) return { ok: false, error: NO_SESION };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: GENERIC_ERROR };

  const [perfil, pedidos] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", claims.userId).maybeSingle(),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
  ]);

  const salida = {
    exportado_el: new Date().toISOString(),
    cuenta: { id: claims.userId, correo: claims.email },
    perfil: perfil.data ?? null,
    pedidos: pedidos.data ?? [],
  };

  return { ok: true, data: { json: JSON.stringify(salida, null, 2) } };
}

/* ── Vía A: cancelación de cuenta ───────────────────────────── */

export async function cancelarMiCuenta(input: {
  password: string;
  confirmacion: string;
}): Promise<ActionResult<{ pedidosAnonimizados: number }>> {
  const claims = await getClaims();
  if (!claims || !claims.email) return { ok: false, error: NO_SESION };

  if (input.confirmacion.trim().toLowerCase() !== claims.email.toLowerCase()) {
    return { ok: false, error: "Escribe tu correo exactamente para confirmar." };
  }

  // Reautenticación con un cliente desechable, sin cookies: si la contraseña
  // falla no queremos haber tocado la sesión activa. Es irreversible, así que
  // no basta con que el navegador tenga una sesión abierta.
  const efimero = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: errorPassword } = await efimero.auth.signInWithPassword({
    email: claims.email,
    password: input.password,
  });
  if (errorPassword) {
    return { ok: false, error: "La contraseña no es correcta." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: GENERIC_ERROR };

  // Anonimiza los pedidos mientras `auth.uid()` todavía vale. Después de
  // borrar el usuario ya no habría forma de saber cuáles eran suyos.
  const { data: anonimizados, error: errorRpc } = await supabase.rpc("cancelar_mi_cuenta");
  if (errorRpc) {
    console.error("[cancelarMiCuenta] rpc", errorRpc.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  const service = createAdminClient();
  if (!service) return { ok: false, error: GENERIC_ERROR };

  const { error: errorBorrado } = await service.auth.admin.deleteUser(claims.userId);
  if (errorBorrado) {
    console.error("[cancelarMiCuenta] deleteUser", errorBorrado.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // Los tokens ya no valen; esto sólo limpia las cookies.
  await supabase.auth.signOut().catch(() => {});

  return { ok: true, data: { pedidosAnonimizados: anonimizados ?? 0 } };
}

/* ── Vía B: solicitudes ARCO ────────────────────────────────── */

/**
 * Alta de una solicitud. Formulario público: el derecho es de cualquier
 * titular, tenga cuenta o no.
 *
 * La verificación de identidad no se hace aquí y no se finge que sí: la
 * acredita el admin por correo antes de entregar o borrar nada.
 */
export async function crearSolicitudArco(input: {
  tipo: string;
  nombre: string;
  email: string;
  detalle: string;
}): Promise<ActionResult<{ mensaje: string }>> {
  if (!TIPOS.includes(input.tipo as ArcoTipo)) {
    return { ok: false, error: "Elige el derecho que quieres ejercer." };
  }
  if (!input.nombre.trim()) return { ok: false, error: "Necesitamos tu nombre." };
  if (!isEmail(input.email)) return { ok: false, error: "Necesitamos un correo válido." };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, error: GENERIC_ERROR };

  const { error } = await supabase.from("arco_requests").insert({
    tipo: input.tipo as ArcoTipo,
    nombre: input.nombre.trim().slice(0, 120),
    email: input.email.trim().toLowerCase(),
    detalle: input.detalle.trim().slice(0, 2000),
  });

  if (error) {
    console.error("[crearSolicitudArco]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // Acuse al solicitante. Hasta ahora la cola era muda: la solicitud
  // entraba y quien la mandó no sabía si había llegado. Si el envío falla,
  // la solicitud ya está registrada y el admin la ve igual.
  await enviarCorreo({
    para: input.email.trim().toLowerCase(),
    ...plantillaArco({ nombre: input.nombre.trim(), tipo: input.tipo }),
  });

  return {
    ok: true,
    data: {
      mensaje:
        "Recibimos tu solicitud. Te escribiremos para acreditar tu identidad antes de atenderla.",
    },
  };
}

export async function resolverSolicitudArco(input: {
  id: string;
  status: string;
  nota: string;
}): Promise<ActionResult> {
  if (!ESTADOS.includes(input.status as ArcoStatus)) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const admin = await adminOrNull();
  if (!admin) return { ok: false, error: NO_AUTORIZADO };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: GENERIC_ERROR };

  const cerrada = input.status === "atendida" || input.status === "rechazada";

  const { data, error } = await supabase
    .from("arco_requests")
    .update({
      status: input.status as ArcoStatus,
      nota: input.nota.trim().slice(0, 2000) || null,
      resolved_at: cerrada ? new Date().toISOString() : null,
      resolved_by: cerrada ? admin.userId : null,
    })
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[resolverSolicitudArco]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  if (!data) return { ok: false, error: NO_AUTORIZADO };

  await logAdminAction(admin, {
    action: "arco.resolucion",
    targetTable: "arco_requests",
    targetId: input.id,
    meta: { status: input.status },
  });

  revalidatePath("/admin/arco");
  return { ok: true };
}
