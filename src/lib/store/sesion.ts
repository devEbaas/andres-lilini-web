"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabase } from "@/lib/supabase/browser";

/** `null` mientras no se sabe; luego, si hay sesión y de qué tipo. */
export type Sesion = { entrado: boolean; esAdmin: boolean } | null;

/**
 * La sesión, resuelta en el navegador.
 *
 * Se lee en el cliente y no en el servidor a propósito: si la cabecera
 * consultara la sesión al renderizar, todo el sitio dejaría de prerenderizarse
 * y `/tienda` perdería su estático. Aquí sólo se hidratan los fragmentos que
 * la necesitan.
 *
 * Devuelve `null` hasta que responde Supabase, para que nada parpadee entre
 * «entrar» y «tu cuenta» en la primera pintura.
 */
export function useSesion(): Sesion {
  const [sesion, setSesion] = useState<Sesion>(null);

  useEffect(() => {
    let vigente = true;
    const supabase = createBrowserSupabase();

    // El estado se fija siempre dentro de esta función y nunca en el cuerpo
    // del efecto: hacerlo de forma síncrona encadena renders.
    const revisar = async () => {
      // Sin Supabase no hay sesión posible, pero sí hay respuesta: así la
      // cabecera puede ofrecer «entrar» en vez de quedarse en blanco.
      const claims = supabase ? (await supabase.auth.getClaims()).data?.claims : null;
      if (!vigente) return;

      setSesion({
        entrado: Boolean(claims),
        esAdmin: claims?.user_role === "admin",
      });
    };

    void revisar();

    if (!supabase) return () => {
      vigente = false;
    };

    // getClaims verifica la firma; getSession devolvería la cookie sin más.
    const { data: sub } = supabase.auth.onAuthStateChange(() => void revisar());

    return () => {
      vigente = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return sesion;
}
