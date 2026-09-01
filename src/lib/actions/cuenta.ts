"use server";

import { revalidatePath } from "next/cache";

import { getClaims } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/urls";
import { GENERIC_ERROR, isEmail, normalizaLocale, type ActionResult } from "./types";

const NO_SESION = "Tu sesión ha caducado. Vuelve a entrar.";
const SIN_CONFIGURAR = "El registro no está disponible en este momento.";

/**
 * Mismo texto haya cuenta o no.
 *
 * Decir «ese correo ya está registrado» convierte el formulario en un oráculo:
 * se prueba una lista y se averigua quién es cliente. Supabase colabora
 * devolviendo un usuario ofuscado cuando el correo ya existe, así que aquí
 * basta con no delatar nada en el mensaje.
 */
const REVISA_CORREO =
  "Si el correo es válido, te enviamos un enlace para confirmar la cuenta.";

/** Espejo de `password_requirements` de Supabase, para dar un mensaje útil. */
function validaPassword(p: string): string | null {
  if (p.length < 12) return "La contraseña necesita al menos 12 caracteres.";
  if (!/[a-z]/.test(p)) return "Añade alguna minúscula.";
  if (!/[A-Z]/.test(p)) return "Añade alguna mayúscula.";
  if (!/\d/.test(p)) return "Añade algún número.";
  return null;
}

export async function signUp(input: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  consent: boolean;
  locale?: string;
}): Promise<ActionResult<{ mensaje: string }>> {
  if (!input.consent) {
    return { ok: false, error: "Necesitamos tu consentimiento para crear la cuenta." };
  }
  if (!input.nombre.trim()) return { ok: false, error: "Dinos cómo te llamas." };
  if (!isEmail(input.email)) return { ok: false, error: "Necesitamos un correo válido." };

  const fallo = validaPassword(input.password);
  if (fallo) return { ok: false, error: fallo };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: SIN_CONFIGURAR };

  const { error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      // Sólo datos de display. El rol lo pone el trigger, siempre 'cliente':
      // nada de lo que llegue aquí decide permisos.
      data: {
        nombre: input.nombre.trim().slice(0, 80),
        apellido: input.apellido.trim().slice(0, 80),
        // Lo lee `handle_new_user` al crear el perfil. Va por aquí porque el
        // trigger corre antes de que exista fila que actualizar.
        locale: normalizaLocale(input.locale),
      },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/cuenta`,
    },
  });

  if (error) {
    console.error("[signUp]", error.message);
    // Los errores de política de contraseña sí se devuelven: son del propio
    // usuario y no revelan nada de terceros.
    if (error.message.toLowerCase().includes("password")) {
      return { ok: false, error: "Esa contraseña no cumple los requisitos." };
    }
    // Cualquier otra cosa, incluido «ya existe», sale como el mensaje neutro.
    return { ok: true, data: { mensaje: REVISA_CORREO } };
  }

  return { ok: true, data: { mensaje: REVISA_CORREO } };
}

export async function solicitarReset(email: string): Promise<ActionResult<{ mensaje: string }>> {
  const neutro = {
    ok: true as const,
    data: { mensaje: "Si el correo tiene cuenta, te enviamos un enlace para cambiarla." },
  };

  if (!isEmail(email)) return neutro;

  const supabase = await createServerSupabase();
  if (!supabase) return neutro;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${siteUrl()}/auth/callback?next=/cuenta/password`,
  });

  // El resultado no cambia el mensaje: si cambiara, sería un oráculo.
  if (error) console.error("[solicitarReset]", error.message);
  return neutro;
}

export async function actualizarPassword(password: string): Promise<ActionResult> {
  const fallo = validaPassword(password);
  if (fallo) return { ok: false, error: fallo };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: GENERIC_ERROR };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[actualizarPassword]", error.message);
    return { ok: false, error: "No pudimos cambiar la contraseña. Vuelve a intentarlo." };
  }
  return { ok: true };
}

export async function actualizarPerfil(input: {
  nombre: string;
  apellido: string;
  telefono: string;
}): Promise<ActionResult> {
  if (!input.nombre.trim()) return { ok: false, error: "El nombre no puede quedar vacío." };

  const claims = await getClaims();
  if (!claims) return { ok: false, error: NO_SESION };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: GENERIC_ERROR };

  // Sin `.eq("id", ...)`: la policy «perfil propio: actualizar» ya limita la
  // fila, y las columnas que no son suyas ni tienen GRANT.
  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: input.nombre.trim().slice(0, 80),
      apellido: input.apellido.trim().slice(0, 80),
      telefono: input.telefono.trim().slice(0, 40) || null,
    })
    .eq("id", claims.userId);

  if (error) {
    console.error("[actualizarPerfil]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/cuenta");
  return { ok: true };
}
