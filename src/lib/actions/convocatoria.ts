"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/lib/content/fundacion";
import { GENERIC_ERROR, isEmail, randomFolio, type ActionResult } from "./types";

export async function submitConvocatoria(
  formData: FormData,
): Promise<ActionResult<{ folio: string }>> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const propuesta = String(formData.get("propuesta") ?? "").trim();
  const okBases = formData.get("bases") === "on";
  const okPriv = formData.get("priv") === "on";
  const file = formData.get("file");

  if (!nombre) return { ok: false, error: "Indique su nombre completo." };
  if (!isEmail(email)) return { ok: false, error: "Se requiere un correo electrónico válido." };
  if (propuesta.length < 20) {
    return { ok: false, error: "Exponga el caso con al menos veinte caracteres." };
  }
  if (!okBases || !okPriv) {
    return { ok: false, error: "Acepte las bases y el aviso de privacidad para participar." };
  }

  const upload = file instanceof File && file.size > 0 ? file : null;
  if (upload) {
    if (upload.size > UPLOAD_MAX_BYTES) {
      return { ok: false, error: "El archivo supera los 25 MB permitidos." };
    }
    if (!UPLOAD_ACCEPT.includes(upload.type)) {
      return { ok: false, error: "Formato no admitido. Use PDF, JPG, PNG o MP4." };
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
      return { ok: false, error: "No fue posible subir el archivo. Inténtelo de nuevo." };
    }
  }

  const { error } = await supabase.from("convocatoria_entries").insert({
    folio: `CV-2026-${folio}`,
    nombre,
    email,
    link: link || null,
    propuesta,
    file_path: filePath,
    file_name: upload?.name ?? null,
    file_size: upload?.size ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ya existe una participación registrada con este correo. Sólo se admite una por participante.",
      };
    }
    console.error("[submitConvocatoria]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, data: { folio } };
}
