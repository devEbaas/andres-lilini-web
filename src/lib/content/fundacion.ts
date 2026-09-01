import { edadEn } from "@/lib/edad";

// El vocabulario del perfil de jugador vive en `jugador.ts`: lo comparten
// la convocatoria y el programa. Se reexporta para no romper los sitios
// que ya lo importaban desde aquí.
export {
  CATEGORIAS,
  ESTADOS_MX,
  PAISES,
  PARENTESCOS,
  PIES,
  POSICIONES,
} from "./jugador";

/** `estado` es una clave: dos campañas comparten rótulo y no se repite. */
export const CAMPAIGNS = [
  { key: "canchas", estado: "enCurso" },
  { key: "visorias", estado: "enCurso" },
  { key: "entrenadores", estado: "abierta" },
  { key: "beca", estado: "piloto" },
];

export const CONVOCATORIA_BRIEF = [
  { n: "01", key: "pedimos" },
  { n: "02", key: "requisitos" },
  { n: "03", key: "eleccion" },
];

export const CONVOCATORIA_CHECKS = [
  { k: "bases", requerido: true },
  { k: "priv", requerido: true },
  // Separado a propósito: evaluar el video y difundirlo son finalidades
  // distintas. Se debe poder aceptar lo primero y rechazar lo segundo.
  { k: "imagen", requerido: false },
];

// ── Elegibilidad ──────────────────────────────────────────────
// Las bases (/contenido/bases) fijan estos límites. Si cambian allí,
// hay que cambiarlos aquí: son la misma regla escrita dos veces.
export const CONVOCATORIA_CIERRE = "2026-11-30";
export const EDAD_MIN = 12;
export const EDAD_MAX = 21;

/**
 * Edad que tendrá el jugador el día del cierre, no hoy.
 *
 * Importa: quien cumple 22 en octubre queda fuera aunque hoy tenga 21, y
 * quien cumple 12 en noviembre entra aunque hoy tenga 11. Calcularlo contra
 * la fecha actual haría que el mismo jugador fuese elegible o no según el
 * día en que abriera el formulario.
 */
export function edadAlCierre(nacimiento: string): number | null {
  return edadEn(nacimiento, CONVOCATORIA_CIERRE);
}



export const UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const UPLOAD_ACCEPT = ["application/pdf", "image/jpeg", "image/png", "video/mp4"];
