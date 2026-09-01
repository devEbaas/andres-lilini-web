"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { conIdioma } from "@/i18n/rutas";

import { getClaims } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/urls";
import {
  GENERIC_ERROR,
  isEmail,
  normalizaLocale,
  type ActionResult,
  type ErrorKey,
} from "./types";

const NO_SESION = "sesionCaducada";
const SIN_CONFIGURAR = "registroNoDisponible";

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
function validaPassword(p: string): ErrorKey | null {
  if (p.length < 12) return "passwordCorta";
  if (!/[a-z]/.test(p)) return "passwordMinuscula";
  if (!/[A-Z]/.test(p)) return "passwordMayuscula";
  if (!/\d/.test(p)) return "passwordNumero";
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
    return { ok: false, code: "consentimientoCuenta" };
  }
  if (!input.nombre.trim()) return { ok: false, code: "nombreNecesario" };
  if (!isEmail(input.email)) return { ok: false, code: "correoNecesario" };

  const fallo = validaPassword(input.password);
  if (fallo) return { ok: false, code: fallo };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, code: SIN_CONFIGURAR };

  const { data, error } = await supabase.auth.signUp({
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
      return { ok: false, code: "passwordDebil" };
    }
    // Cualquier otra cosa, incluido «ya existe», sale como el mensaje neutro.
    return { ok: true, data: { mensaje: REVISA_CORREO } };
  }

  // Con la confirmación por correo desactivada en Supabase, `signUp` ya
  // devuelve sesión: la cuenta queda usable al instante y decir «revisa tu
  // correo» sería falso.
  //
  // Se redirige desde el servidor, igual que en `signIn`: así la cookie recién
  // escrita y la navegación viajan en la misma respuesta. Devolver un mensaje
  // dejaba a la persona dentro pero en una página que seguía ofreciéndole
  // «Entrar», sin nada que la llevara a su cuenta.
  if (data.session) {
    redirect(conIdioma("/cuenta", normalizaLocale(input.locale)));
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
  if (fallo) return { ok: false, code: fallo };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[actualizarPassword]", error.message);
    return { ok: false, code: "passwordNoCambiada" };
  }
  return { ok: true };
}

export async function actualizarPerfil(input: {
  nombre: string;
  apellido: string;
  telefono: string;
}): Promise<ActionResult> {
  if (!input.nombre.trim()) return { ok: false, code: "nombreVacio" };

  const claims = await getClaims();
  if (!claims) return { ok: false, code: NO_SESION };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, code: GENERIC_ERROR };

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
    return { ok: false, code: GENERIC_ERROR };
  }

  revalidatePath("/cuenta");
  return { ok: true };
}
