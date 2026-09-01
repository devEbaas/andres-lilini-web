import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Sustitutos de `next/link` y `next/navigation` conscientes del idioma.
 *
 * A partir de aquí ningún componente importa `Link` de `next/link`: el de
 * next-intl es el que traduce `/tienda` a `/en/store` sin que quien escribe el
 * enlace tenga que saberlo. Los `href` se escriben siempre en su forma interna
 * —la ruta en español, que es como se llaman las carpetas— y el idioma activo
 * decide la URL final.
 *
 * `usePathname` devuelve la ruta interna, sin prefijo de idioma. Es lo que
 * quiere el `Header` para marcar el enlace activo: la misma comparación vale
 * en los dos idiomas.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
