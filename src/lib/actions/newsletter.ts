"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { GENERIC_ERROR, isEmail, normalizaLocale, type ActionResult } from "./types";

export async function subscribe(email: string, locale?: string): Promise<ActionResult> {
  if (!isEmail(email)) {
    return { ok: false, error: "Escribe un correo válido." };
  }

  const supabase = createAdminClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.trim().toLowerCase(), locale: normalizaLocale(locale) });

  // 23505 = correo ya suscrito. Para quien se suscribe el resultado es el mismo.
  if (error && error.code !== "23505") {
    console.error("[subscribe]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  return { ok: true };
}
