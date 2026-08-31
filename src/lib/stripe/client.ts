import "server-only";
import Stripe from "stripe";

export { siteUrl } from "@/lib/urls";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";

let cached: Stripe | null = null;

/**
 * Cliente de Stripe para el servidor. Devuelve `null` si no hay clave,
 * igual que `createAdminClient()`: sin Stripe configurado el sitio sigue
 * navegable y el cajón cae al modo demo en vez de romperse.
 */
export function getStripe(): Stripe | null {
  if (!SECRET_KEY) return null;
  cached ??= new Stripe(SECRET_KEY);
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(SECRET_KEY);
}

/** El catálogo guarda pesos enteros (480, 650, 1890); Stripe cobra centavos. */
export function toCents(pesos: number): number {
  return Math.round(pesos * 100);
}
