"use server";

import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
import { conIdioma } from "@/i18n/rutas";
import { isEmail, normalizaLocale, type ActionResult } from "./types";

/**
 * Mensaje único para cualquier fallo de acceso.
 *
 * Distinguir «ese correo no existe» de «contraseña incorrecta» convierte el
 * formulario en un oráculo: se prueba una lista de correos y se averigua
 * cuáles tienen cuenta. Tampoco se dice si la cuenta está sin confirmar, por
 * lo mismo.
 */
const CREDENCIALES = "credenciales";
const SIN_CONFIGURAR = "accesoNoDisponible";

export async function signIn(input: {
  email: string;
  password: string;
  next?: string;
  locale?: string;
}): Promise<ActionResult<{ mfa: true }>> {
  if (!isEmail(input.email) || !input.password) {
    return { ok: false, code: CREDENCIALES };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, code: SIN_CONFIGURAR };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error || !data.session) {
    // El detalle va al log del servidor, nunca al navegador.
    if (error) console.error("[signIn]", error.message);
    return { ok: false, code: CREDENCIALES };
  }

  // La contraseña sólo da aal1. Si la cuenta tiene un segundo factor, la
  // sesión todavía no sirve para nada: falta el código.
  const { data: nivel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (nivel?.nextLevel === "aal2" && nivel.currentLevel !== "aal2") {
    return { ok: true, data: { mfa: true } };
  }

  // El rol lo pone el hook como claim del JWT, no en `app_metadata`: se lee
  // del token recién emitido, verificando la firma.
  const { data: verificado } = await supabase.auth.getClaims(data.session.access_token);
  const esAdmin = verificado?.claims?.user_role === "admin";
  // El panel sólo existe en español, así que va sin traducir. La cuenta de
  // cliente sí sigue el idioma con el que se entró.
  const porDefecto = esAdmin ? "/admin" : conIdioma("/cuenta", normalizaLocale(input.locale));

  // Redirige el servidor, no el navegador. Escribir la cookie de sesión y
  // navegar en la misma respuesta las hace atómicas: si el cliente hiciera
  // `refresh()` y `replace()` por su cuenta, la primera petición podría
  // renderizarse todavía con el token anterior. `redirect()` lanza, así que
  // esta función sólo vuelve cuando algo falló.
  redirect(safeNext(input.next, porDefecto));
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: true };

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[signOut]", error.message);
    return { ok: false, code: "noCerroSesion" };
  }
  return { ok: true };
}
