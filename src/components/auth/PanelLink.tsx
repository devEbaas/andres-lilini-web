"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { routing, type RutaEstatica } from "@/i18n/routing";
import { useSesion } from "@/lib/store/sesion";

const CLASES =
  "grid min-h-11 shrink-0 place-items-center rounded-full border border-hairline bg-panel px-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors duration-[250ms] hover:border-accent hover:text-ink";

/**
 * Acceso a la zona privada desde la cabecera.
 *
 * Muestra «Entrar» a quien no tiene sesión y su destino a quien sí. Hasta
 * ahora no pintaba nada sin sesión, y como el footer tampoco enlazaba a
 * `/login`, no había forma de llegar a la cuenta salvo escribiendo la URL.
 */
export function PanelLink() {
  const t = useTranslations("auth");
  const sesion = useSesion();

  // Mientras no se sabe, nada: es preferible que aparezca un instante después
  // a que cambie de «entrar» a «cuenta» delante de quien mira.
  if (!sesion) return null;

  if (!sesion.entrado) {
    return (
      <Link href="/login" className={CLASES}>
        {t("entrar")}
      </Link>
    );
  }

  const destino: RutaEstatica = sesion.esAdmin ? "/admin" : "/cuenta";

  return (
    <Link
      href={destino}
      /* El panel sólo existe en español. La cuenta de cliente sigue el idioma
         activo, como el resto del sitio. */
      {...(sesion.esAdmin ? { locale: routing.defaultLocale } : {})}
      className={CLASES}
    >
      {sesion.esAdmin ? t("panel") : t("miCuenta")}
    </Link>
  );
}
