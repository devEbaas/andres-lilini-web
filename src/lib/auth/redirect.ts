/**
 * Valida el `?next=` del login.
 *
 * Sin esto es un vector de phishing: `/login?next=https://sitio-falso.com`
 * devuelve al usuario al atacante justo después de iniciar sesión, con toda
 * la apariencia de ser parte del flujo legítimo.
 *
 * Sólo se aceptan rutas internas. `//host` y `/\host` son rutas protocol
 * relative que el navegador resuelve como dominio externo, así que fuera.
 */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
