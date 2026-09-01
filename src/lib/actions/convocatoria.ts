"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  CATEGORIAS,
  CONVOCATORIA_CHECKS,
  EDAD_MAX,
  EDAD_MIN,
  ESTADOS_MX,
  PARENTESCOS,
  PIES,
  POSICIONES,
  UPLOAD_ACCEPT,
  UPLOAD_MAX_BYTES,
  edadAlCierre,
} from "@/lib/content/fundacion";
import { esMenorHoy } from "@/lib/edad";
import { GENERIC_ERROR, isEmail, normalizaLocale, randomFolio, type ActionResult, type ErrorRef } from "./types";

const REQUERIDOS = CONVOCATORIA_CHECKS.filter((c) => c.requerido).map((c) => c.k);

const REVISA = "revisaCampos";

export async function submitConvocatoria(
  formData: FormData,
): Promise<ActionResult<{ folio: string }>> {
  const t = (k: string) => String(formData.get(k) ?? "").trim();

  const nombre = t("nombre");
  const email = t("email");
  const nacimiento = t("nacimiento");
  const pais = t("pais");
  const estado = t("estado");
  const categoria = t("categoria");
  const posicion = t("posicion");
  const pie = t("pie");
  const club = t("club");
  const liga = t("liga");
  const link = t("link");
  const propuesta = t("propuesta");
  const tutorNombre = t("tutorNombre");
  const tutorParentesco = t("tutorParentesco");
  const tutorTel = t("tutorTel");
  const tutorEmail = t("tutorEmail");

  const fieldErrors: Record<string, ErrorRef> = {};

  // ── Identidad ──
  if (!nombre) fieldErrors.nombre = "nombreCompleto";
  if (!isEmail(email)) fieldErrors.email = "correoNecesario";

  // ── Elegibilidad ──
  // Las bases fijan 12 a 21 años y residencia en México. Hasta ahora eran
  // requisitos publicados que nadie comprobaba.
  if (!nacimiento) {
    fieldErrors.nacimiento = "fechaNecesaria";
  } else {
    const edad = edadAlCierre(nacimiento);
    if (edad === null) {
      fieldErrors.nacimiento = "fechaInvalida";
    } else if (edad < EDAD_MIN || edad > EDAD_MAX) {
      // Se dice la razón exacta: quedar fuera por edad no es un error del
      // participante y merece una explicación, no un «revisa los campos».
      fieldErrors.nacimiento = {
        k: "edadFueraDeRango",
        p: { min: EDAD_MIN, max: EDAD_MAX, edad },
      };
    }
  }

  // ── Tutor, si es menor ──
  // La minoría se mide hoy y la elegibilidad al cierre: son dos preguntas
  // distintas sobre la misma persona. Quien tiene 17 al enviar es menor
  // aunque cumpla 18 antes del 30 de noviembre.
  const esMenor = Boolean(nacimiento) && esMenorHoy(nacimiento);

  if (esMenor) {
    if (!tutorNombre) fieldErrors.tutorNombre = "obligatorioMenores";
    if (!PARENTESCOS.includes(tutorParentesco)) {
      fieldErrors.tutorParentesco = "eligeParentesco";
    }
    if (!tutorTel) fieldErrors.tutorTel = "contactoTutor";
    if (tutorEmail && !isEmail(tutorEmail)) {
      fieldErrors.tutorEmail = "correoFormato";
    }
    if (formData.get("tutor") !== "on") {
      fieldErrors.tutor = "autorizacionTutor";
    }
  }

  if (pais !== "México") {
    fieldErrors.pais = "soloMexico";
  } else if (!ESTADOS_MX.includes(estado)) {
    fieldErrors.estado = "eligeEstado";
  }

  if (formData.get("contrato") !== "on") {
    fieldErrors.contrato = "declaracionNecesaria";
  }

  // ── Perfil deportivo ──
  if (!CATEGORIAS.includes(categoria)) fieldErrors.categoria = "eligeCategoria";
  if (!POSICIONES.includes(posicion)) fieldErrors.posicion = "eligePosicion";
  if (!PIES.includes(pie)) fieldErrors.pie = "indicaPie";
  if (!club) fieldErrors.club = "equipoActual";

  // ── Propuesta y consentimientos ──
  if (propuesta.length < 20) {
    fieldErrors.propuesta = "propuestaCorta";
  }
  for (const k of REQUERIDOS) {
    if (formData.get(k) !== "on") fieldErrors[k] = "aceptacionNecesaria";
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, code: REVISA, fieldErrors };
  }

  // ── Archivo ──
  const file = formData.get("file");
  const upload = file instanceof File && file.size > 0 ? file : null;
  if (upload) {
    if (upload.size > UPLOAD_MAX_BYTES) {
      return { ok: false, code: "archivoGrande" };
    }
    if (!UPLOAD_ACCEPT.includes(upload.type)) {
      return { ok: false, code: "formatoMal" };
    }
  }

  const folio = randomFolio();
  const supabase = createAdminClient();
  if (!supabase) return { ok: true, data: { folio } };

  let filePath: string | null = null;
  if (upload) {
    const ext = upload.name.split(".").pop()?.toLowerCase() ?? "bin";
    filePath = `CV-2026-${folio}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("convocatoria")
      .upload(filePath, upload, { contentType: upload.type, upsert: false });

    if (uploadError) {
      console.error("[submitConvocatoria:upload]", uploadError.message);
      return { ok: false, code: "subidaFallida" };
    }
  }

  const { error } = await supabase.from("convocatoria_entries").insert({
    folio: `CV-2026-${folio}`,
    locale: normalizaLocale(formData.get("locale")),
    nombre,
    email,
    link: link || null,
    propuesta,
    file_path: filePath,
    file_name: upload?.name ?? null,
    file_size: upload?.size ?? null,
    nacimiento,
    pais,
    estado,
    categoria,
    posicion,
    pie,
    club,
    liga: liga || null,
    sin_contrato: true,
    es_menor: esMenor,
    // Sólo si aplican: de un mayor de edad no hay tutor que registrar.
    tutor_nombre: esMenor ? tutorNombre : null,
    tutor_parentesco: esMenor ? tutorParentesco : null,
    tutor_tel: esMenor ? tutorTel : null,
    tutor_email: esMenor ? tutorEmail || null : null,
    // El de imagen es opcional a propósito: se puede aceptar la evaluación
    // y rechazar la difusión.
    ok_imagen: formData.get("imagen") === "on",
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        code: "participacionDuplicada",
      };
    }
    console.error("[submitConvocatoria]", error.message);
    return { ok: false, code: GENERIC_ERROR };
  }

  return { ok: true, data: { folio } };
}
