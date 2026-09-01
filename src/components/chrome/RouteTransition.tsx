"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

/**
 * Equivalente a la animación `routeIn` del canvas. Se remonta sólo cuando
 * cambia la ruta —no con los enlaces de ancla— para no romper el scroll a
 * #trayectoria, #form o #participar.
 *
 * `usePathname` viene de `next/navigation` a propósito, no de la capa i18n: el
 * de next-intl devuelve la ruta interna, igual en los dos idiomas, y entonces
 * cambiar de idioma en la misma página no dispararía el fundido. Aquí interesa
 * la URL real.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
