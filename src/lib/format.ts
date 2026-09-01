import type { Locale } from "@/i18n/routing";

/**
 * Un importe en pesos mexicanos.
 *
 * La tienda cobra en MXN en los dos idiomas: cobrar en dólares obligaría a
 * precios multi-divisa en Stripe, a rehacer `SHIPPING_MXN` y a resolver envíos
 * internacionales. Es un proyecto aparte, no un efecto de traducir el sitio.
 *
 * El español conserva su formato de siempre —`$480.00 MXN`—. El inglés lleva
 * el prefijo `MX$`: un `$` a secas delante de un número lo lee como dólares
 * cualquiera que no esté en México, y la diferencia entre 480 pesos y 480
 * dólares es un contracargo.
 *
 * El número se formatea igual en los dos: es-MX y en-US comparten el punto
 * decimal y la coma de millares, así que sólo cambian los afijos.
 */
export function money(n: number, locale: Locale = "es"): string {
  const cifra = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
  return locale === "en" ? `MX$${cifra}` : `$${cifra} MXN`;
}

export function folio(prefix: string, n: number): string {
  return `${prefix}-2026-${String(n).padStart(4, "0")}`;
}

/**
 * Tamaño de archivo.
 *
 * Sin idioma a propósito: es-MX y en-US usan el mismo punto decimal, así que
 * «1.5 MB» vale para los dos y añadir un parámetro no compraría nada.
 */
export function bytesToMb(bytes: number): string {
  return (bytes / 1048576).toFixed(1) + " MB";
}
