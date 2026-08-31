"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { APPLY_STEPS } from "@/lib/content/programa";
import { PARENTESCOS } from "@/lib/content/fundacion";
import { esMenorHoy } from "@/lib/edad";
import { GENERIC_ERROR, isEmail, randomFolio, type ActionResult } from "./types";

export type ApplyPayload = Record<string, string | boolean>;

const CAMPOS = APPLY_STEPS.flatMap((s) => s.fields);
const SIEMPRE = CAMPOS.filter((f) => f.required);
const SI_MENOR = CAMPOS.filter((f) => f.requiredIfMenor);

export async function submitApplication(
  payload: ApplyPayload,
): Promise<ActionResult<{ folio: string }>> {
  const fieldErrors: Record<string, string> = {};
  const t = (k: string) => String(payload[k] ?? "").trim();

  for (const f of SIEMPRE) {
    if (!t(f.key)) fieldErrors[f.key] = "Este dato es obligatorio.";
  }

  const email = t("email");
  if (email && !isEmail(email)) fieldErrors.email = "Revisa el formato del correo.";
  if (!payload.okPriv) fieldErrors.okPriv = "Necesitamos tu consentimiento para continuar.";
  if (!payload.okVerdad) fieldErrors.okVerdad = "Confirma que la información es verídica.";

  // ── Menores ───────────────────────────────────────────────
  // La minoría se mide hoy, no al cierre de nada: es el momento en que se
  // recogen los datos y se otorga el consentimiento. Quien tiene 17 al
  // enviar es menor aunque cumpla 18 la semana siguiente.
  const nacimiento = t("nac");
  const esMenor = Boolean(nacimiento) && esMenorHoy(nacimiento);

  if (esMenor) {
    for (const f of SI_MENOR) {
      const vacio = f.type === "check" ? !payload[f.key] : !t(f.key);
      if (vacio) {
        fieldErrors[f.key] =
          f.type === "check"
            ? "Necesitamos la autorización de tu tutor."
            : "Obligatorio para menores de edad.";
      }
    }
    const parentesco = t("parentesco");
    if (parentesco && !PARENTESCOS.includes(parentesco)) {
      fieldErrors.parentesco = "Elige el parentesco.";
    }
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }

  const folio = randomFolio();
  const supabase = createAdminClient();

  // Sin Supabase configurado el formulario sigue siendo usable en local.
  if (!supabase) return { ok: true, data: { folio } };

  const { error } = await supabase.from("applications").insert({
    folio: `AL-2026-${folio}`,
    nombre: t("nombre"),
    email,
    video_url: t("video") || null,
    payload: payload as never,
    nacimiento: nacimiento || null,
    es_menor: esMenor,
    // Sólo se guardan si aplican: de un mayor de edad no hay tutor que
    // registrar, y guardar los datos de un adulto ajeno «por si acaso» es
    // recoger a alguien que no se postuló.
    tutor_nombre: esMenor ? t("tutor") : null,
    tutor_parentesco: esMenor ? t("parentesco") : null,
    tutor_tel: esMenor ? t("tutorTel") : null,
    tutor_email: esMenor ? t("tutorEmail") || null : null,
  });

  if (error) {
    console.error("[submitApplication]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, data: { folio } };
}
