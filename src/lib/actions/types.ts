export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const GENERIC_ERROR =
  "No pudimos registrar el envío. Inténtalo de nuevo en un momento.";

export function randomFolio(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
