"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { createBrowserSupabase } from "@/lib/supabase/browser";

/** `null` mientras no se sabe; luego, si hay sesión y de qué tipo. */
export type Sesion = { entrado: boolean; esAdmin: boolean } | null;

/**
 * Lee la sesión y la reduce a lo que necesita la interfaz.
 *
 * Cualquier fallo cuenta como «sin sesión»: es la respuesta segura y deja la
 * cabecera ofreciendo «entrar» en vez de quedarse en blanco para siempre.
 */
async function leerSesion(): Promise<Exclude<Sesion, null>> {
  const supabase = createBrowserSupabase();
  if (!supabase) return { entrado: false, esAdmin: false };

  try {
    // getClaims verifica la firma; getSession devolvería la cookie sin más.
    const claims = (await supabase.auth.getClaims()).data?.claims;
    return { entrado: Boolean(claims), esAdmin: claims?.user_role === "admin" };
  } catch {
    return { entrado: false, esAdmin: false };
  }
}

/**
 * La sesión, resuelta en el navegador.
 *
 * Se lee en el cliente y no en el servidor a propósito: si la cabecera
 * consultara la sesión al renderizar, todo el sitio dejaría de prerenderizarse
 * y `/tienda` perdería su estático. Aquí sólo se hidratan los fragmentos que
 * la necesitan.
 *
 * Devuelve `null` hasta que hay respuesta, para que nada parpadee entre
 * «entrar» y «cuenta» en la primera pintura.
 */
export function useSesion(): Sesion {
  const [sesion, setSesion] = useState<Sesion>(null);
  const pathname = usePathname();

  /**
   * Se comprueba al montar y **en cada navegación**.
   *
   * Entrar, registrarse y salir terminan en un `redirect()` del servidor, que
   * en Next es una navegación de cliente: el layout raíz —y con él la
   * cabecera— no se desmonta. Sin esto, quien acaba de crear su cuenta seguía
   * viendo «Entrar» hasta recargar a mano, y quien salía seguía viendo
   * «Cuenta».
   *
   * El coste es una comprobación por navegación, y es local: se lee la cookie
   * y se verifica la firma del JWT sin salir a la red.
   */
  useEffect(() => {
    let vivo = true;
    void leerSesion().then((s) => {
      if (vivo) setSesion(s);
    });
    return () => {
      vivo = false;
    };
  }, [pathname]);

  /** Y también cuando Supabase avisa por su cuenta —otra pestaña, caducidad—. */
  useEffect(() => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    let vivo = true;
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void leerSesion().then((s) => {
        if (vivo) setSesion(s);
      });
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return sesion;
}
