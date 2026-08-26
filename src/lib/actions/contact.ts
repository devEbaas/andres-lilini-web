"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { GENERIC_ERROR, isEmail, type ActionResult } from "./types";

export async function submitContact(input: {
  nombre: string;
  email: string;
  topic: string;
  message: string;
  consent: boolean;
}): Promise<ActionResult> {
  if (!input.consent) {
    return { ok: false, error: "Se requiere el consentimiento para poder responder." };
  }
  if (!input.nombre.trim()) {
    return { ok: false, error: "Indique su nombre completo." };
  }
  if (!isEmail(input.email)) {
    return { ok: false, error: "Se requiere un correo electrónico válido." };
  }
  if (input.message.trim().length < 10) {
    return { ok: false, error: "Describa el asunto con al menos diez caracteres." };
  }

  const supabase = createAdminClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from("contact_messages").insert({
    nombre: input.nombre.trim(),
    email: input.email.trim(),
    topic: input.topic,
    message: input.message.trim().slice(0, 800),
  });

  if (error) {
    console.error("[submitContact]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  return { ok: true };
}
