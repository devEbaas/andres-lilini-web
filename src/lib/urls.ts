import "server-only";

/**
 * URL pública del sitio. Base de los `success_url` de Stripe y de los enlaces
 * que Supabase manda por correo.
 *
 * Se usa esto y no el `Host` de la petición a propósito: un `Host` falsificado
 * en un correo de confirmación manda el token del usuario al dominio del
 * atacante.
 */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
