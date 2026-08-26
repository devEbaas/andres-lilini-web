"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { APPLY_STEPS } from "@/lib/content/programa";
import { GENERIC_ERROR, isEmail, randomFolio, type ActionResult } from "./types";

export type ApplyPayload = Record<string, string | boolean>;

const REQUIRED = APPLY_STEPS.flatMap((s) => s.fields.filter((f) => f.required).map((f) => f));

export async function submitApplication(
  payload: ApplyPayload,
): Promise<ActionResult<{ folio: string }>> {
  const fieldErrors: Record<string, string> = {};

  for (const f of REQUIRED) {
    if (!String(payload[f.key] ?? "").trim()) {
      fieldErrors[f.key] = "Este dato es obligatorio.";
    }
  }
  const email = String(payload.email ?? "").trim();
  if (email && !isEmail(email)) fieldErrors.email = "Revise el formato del correo.";
  if (!payload.okPriv) fieldErrors.okPriv = "Se requiere el consentimiento para continuar.";
  if (!payload.okVerdad) fieldErrors.okVerdad = "Confirme que la información es verídica.";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Revise los campos marcados.", fieldErrors };
  }

  const folio = randomFolio();
  const supabase = createAdminClient();

  // Sin Supabase configurado el formulario sigue siendo usable en local.
  if (!supabase) return { ok: true, data: { folio } };

  const { error } = await supabase.from("applications").insert({
    folio: `AL-2026-${folio}`,
    nombre: String(payload.nombre ?? "").trim(),
    email,
    video_url: String(payload.video ?? "").trim() || null,
    payload: payload as never,
  });

  if (error) {
    console.error("[submitApplication]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, data: { folio } };
}
