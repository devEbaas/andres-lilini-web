import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Tokens de enlace privado: expediente del preseleccionado y verificación
 * del tutor. En los dos casos el enlace **es** la credencial, así que en la
 * base sólo vive su SHA-256 — si se filtrara, los enlaces no serían
 * utilizables. Es el mismo criterio con el que se guarda una contraseña.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** 32 bytes: no se adivina ni se recorre por fuerza bruta. */
export function nuevoToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Un token demasiado corto ni se busca: no puede ser de los nuestros. */
export function tokenPlausible(token: string): boolean {
  return typeof token === "string" && token.length >= 20;
}

export function enDias(dias: number): Date {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
}

export function caducado(iso: string | null | undefined): boolean {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) || t < Date.now();
}
