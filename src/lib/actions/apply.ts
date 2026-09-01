"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { APPLY_STEPS } from "@/lib/content/programa";
import { MAX_CLUBES, PARENTESCOS, TUTOR_DIAS } from "@/lib/content/jugador";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaTutor } from "@/lib/email/plantillas";
import { enDias, hashToken, nuevoToken } from "@/lib/tokens";
import { siteUrl } from "@/lib/urls";
import { esMenorHoy } from "@/lib/edad";
import { GENERIC_ERROR, isEmail, normalizaLocale, randomFolio, type ActionResult, type ErrorRef } from "./types";

/** Una fila del historial de clubes tal como la manda el formulario. */
export type ClubEntry = { club: string; categoria: string; desde: string; hasta: string };

export type ApplyPayload = Record<string, string | boolean | ClubEntry[]>;

const CAMPOS = APPLY_STEPS.flatMap((s) => s.fields);
const SIEMPRE = CAMPOS.filter((f) => f.required);
const SI_MENOR = CAMPOS.filter((f) => f.requiredIfMenor);

export async function submitApplication(
  payload: ApplyPayload,
  /** Idioma del formulario: decide en qué lengua se responde después. */
  locale?: string,
): Promise<ActionResult<{ folio: string }>> {
  const fieldErrors: Record<string, ErrorRef> = {};
  const t = (k: string) => String(payload[k] ?? "").trim();

  for (const f of SIEMPRE) {
    if (!t(f.key)) fieldErrors[f.key] = "obligatorio";
  }

  const email = t("email");
  if (email && !isEmail(email)) fieldErrors.email = "correoFormato";
  if (!payload.okPriv) fieldErrors.okPriv = "consentimientoContinuar";
  if (!payload.okVerdad) fieldErrors.okVerdad = "confirmaVeracidad";

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
            ? "autorizacionTutor"
            : "obligatorioMenores";
      }
    }
    const parentesco = t("parentesco");
    if (parentesco && !PARENTESCOS.includes(parentesco)) {
      fieldErrors.parentesco = "eligeParentesco";
    }
    const tutorEmail = t("tutorEmail");
    if (tutorEmail && !isEmail(tutorEmail)) {
      fieldErrors.tutorEmail = "correoFormato";
    }
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, code: "revisaCampos", fieldErrors };
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
      locale: normalizaLocale(locale),
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
    return { ok: false, code: GENERIC_ERROR };
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

  // ── Verificación del tutor ────────────────────────────────
  // Hasta aquí el consentimiento era declarativo: una casilla que podía
  // marcar el propio menor. El enlace al correo del tutor es lo que lo
  // convierte en demostrable, que es lo que la ley pide.
  //
  // Si el correo no sale, la postulación NO se pierde: queda registrada y
  // sin verificar, y el panel la muestra como pendiente. Un fallo de envío
  // no es motivo para descartar a nadie.
  if (esMenor) {
    const token = nuevoToken();
    const expira = enDias(TUTOR_DIAS);

    const { error: errorToken } = await supabase
      .from("applications")
      .update({ tutor_token_hash: hashToken(token), tutor_token_expira: expira.toISOString() })
      .eq("id", fila.id);

    if (errorToken) {
      console.error("[submitApplication] token de tutor", errorToken.message);
    } else {
      // Va bilingüe si la postulación no fue en español: quien autoriza es
      // el tutor, y no tiene por qué leer el idioma que eligió el jugador.
      const plantilla = await plantillaTutor(
        {
          jugador: t("nombre"),
          folio: `AL-2026-${folio}`,
          url: `${siteUrl()}/tutor/${token}`,
          dias: TUTOR_DIAS,
        },
        normalizaLocale(locale),
      );
      await enviarCorreo({ para: t("tutorEmail"), ...plantilla });
    }
  }

  return { ok: true, data: { folio } };
}
