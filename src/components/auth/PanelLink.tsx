"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Atajo al panel para quien ya tiene sesión de admin.
 *
 * Es un Client Component a propósito: si el header leyera la sesión en el
 * servidor, todo el sitio dejaría de prerenderizarse y `/tienda` perdería su
 * estático. Aquí sólo se hidrata este fragmento.
 *
 * No se muestra un enlace de «Entrar» al público: el acceso es privado y no
 * hace falta anunciar la puerta desde una web de marketing.
 */
export function PanelLink() {
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    let vigente = true;

    const revisar = async () => {
      // getClaims verifica la firma; getSession devolvería la cookie sin más.
      const { data } = await supabase.auth.getClaims();
      if (vigente) setEsAdmin(data?.claims?.user_role === "admin");
    };

    void revisar();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void revisar());

    return () => {
      vigente = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!esAdmin) return null;

  return (
    <Link
      href="/admin"
      className="grid min-h-11 shrink-0 place-items-center rounded-full border border-hairline bg-panel px-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors duration-[250ms] hover:border-accent hover:text-ink"
    >
      Panel
    </Link>
  );
}
