"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { GENERIC_ERROR, isEmail, normalizaLocale, type ActionResult } from "./types";

export async function submitContact(input: {
  nombre: string;
  email: string;
  topic: string;
  message: string;
  consent: boolean;
  locale?: string;
}): Promise<ActionResult> {
  if (!input.consent) {
    return { ok: false, code: "consentimientoRespuesta" };
  }
  if (!input.nombre.trim()) {
    return { ok: false, code: "nombreNecesario" };
  }
  if (!isEmail(input.email)) {
    return { ok: false, code: "correoParaResponder" };
  }
  if (input.message.trim().length < 10) {
    return { ok: false, code: "mensajeCorto" };
  }

  const supabase = createAdminClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from("contact_messages").insert({
    locale: normalizaLocale(input.locale),
    nombre: input.nombre.trim(),
    email: input.email.trim(),
    topic: input.topic,
    message: input.message.trim().slice(0, 800),
  });

  if (error) {
    console.error("[submitContact]", error.message);
    return { ok: false, code: GENERIC_ERROR };
  }
  return { ok: true };
}
