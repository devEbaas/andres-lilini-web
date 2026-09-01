"use client";

import { Link } from "@/i18n/navigation";
import { routing, type RutaEstatica } from "@/i18n/routing";
import { useEffect, useState } from "react";

import { createBrowserSupabase } from "@/lib/supabase/browser";

type Estado = { href: RutaEstatica; label: string } | null;

/**
 * Atajo a la zona privada de quien ya tiene sesión.
 *
 * Es un Client Component a propósito: si el header leyera la sesión en el
 * servidor, todo el sitio dejaría de prerenderizarse y `/tienda` perdería su
 * estático. Aquí sólo se hidrata este fragmento.
 *
 * No se muestra «Entrar» a quien no tiene sesión: el registro vive en
 * `/registro` y se llega desde el checkout, no desde el header.
 */
export function PanelLink() {
  const [estado, setEstado] = useState<Estado>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    let vigente = true;

    const revisar = async () => {
      // getClaims verifica la firma; getSession devolvería la cookie sin más.
      const { data } = await supabase.auth.getClaims();
      if (!vigente) return;

      const claims = data?.claims;
      if (!claims) return setEstado(null);
      setEstado(
        claims.user_role === "admin"
          ? { href: "/admin", label: "Panel" }
          : { href: "/cuenta", label: "Cuenta" },
      );
    };

    void revisar();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void revisar());

    return () => {
      vigente = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!estado) return null;

  return (
    <Link
      href={estado.href}
      /* El panel sólo existe en español. Sin esto, desde una página en inglés
         el enlace apuntaría a `/en/admin` y haría falta un redirect para
         llegar. La cuenta de cliente sí sigue el idioma activo. */
      {...(estado.href === "/admin" ? { locale: routing.defaultLocale } : {})}
      className="grid min-h-11 shrink-0 place-items-center rounded-full border border-hairline bg-panel px-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors duration-[250ms] hover:border-accent hover:text-ink"
    >
      {estado.label}
    </Link>
  );
}
