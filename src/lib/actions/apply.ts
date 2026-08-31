"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { APPLY_STEPS } from "@/lib/content/programa";
import { MAX_CLUBES, PARENTESCOS } from "@/lib/content/jugador";
import { esMenorHoy } from "@/lib/edad";
import { GENERIC_ERROR, isEmail, randomFolio, type ActionResult } from "./types";

/** Una fila del historial de clubes tal como la manda el formulario. */
export type ClubEntry = { club: string; categoria: string; desde: string; hasta: string };

export type ApplyPayload = Record<string, string | boolean | ClubEntry[]>;

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

  // Entero o null: el formulario manda cadenas, y "" o "abc" no son ceros.
  const n = (k: string) => {
    const v = t(k);
    return /^\d+$/.test(v) ? Number(v) : null;
  };

  const { data: fila, error } = await supabase
    .from("applications")
    .insert({
      folio: `AL-2026-${folio}`,
      nombre: t("nombre"),
      email,
      video_url: t("video") || null,
      // `payload` guarda el envío íntegro; las columnas son su proyección
      // consultable. Se duplica a propósito: una conserva lo que se mandó,
      // la otra permite filtrar sin recorrer un blob.
      payload: payload as never,
      pais: t("pais") || null,
      estado: t("estado") || null,
      ciudad: t("ciudad") || null,
      posicion: t("pos1") || null,
      posicion_sec: t("pos2") || null,
      pie: t("pie") || null,
      estatura: n("estatura"),
      peso: n("peso"),
      club: t("equipo") || null,
      liga: t("liga") || null,
      anios_practica: n("anios"),
      nivel: t("nivel") || null,
      escolaridad: t("escolaridad") || null,
      estudia: t("estudia") ? t("estudia") === "Sí" : null,
      turno: t("turno") || null,
    nacimiento: nacimiento || null,
    es_menor: esMenor,
    // Sólo se guardan si aplican: de un mayor de edad no hay tutor que
    // registrar, y guardar los datos de un adulto ajeno «por si acaso» es
    // recoger a alguien que no se postuló.
    tutor_nombre: esMenor ? t("tutor") : null,
    tutor_parentesco: esMenor ? t("parentesco") : null,
    tutor_tel: esMenor ? t("tutorTel") : null,
      tutor_email: esMenor ? t("tutorEmail") || null : null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[submitApplication]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // El historial va después y en su propia tabla. Si falla, la postulación
  // ya está guardada y no se pierde: el historial es contexto, no requisito.
  const clubes = Array.isArray(payload.clubes) ? payload.clubes : [];
  const filas = clubes
    .filter((c) => c.club?.trim())
    .slice(0, MAX_CLUBES)
    .map((c, i) => ({
      application_id: fila.id,
      club: c.club.trim().slice(0, 120),
      categoria: c.categoria?.trim() || null,
      desde: /^\d{4}$/.test(c.desde ?? "") ? Number(c.desde) : null,
      hasta: /^\d{4}$/.test(c.hasta ?? "") ? Number(c.hasta) : null,
      orden: i,
    }));

  if (filas.length) {
    const { error: errorClubes } = await supabase.from("application_clubs").insert(filas);
    if (errorClubes) console.error("[submitApplication] clubes", errorClubes.message);
  }

  return { ok: true, data: { folio } };
}
