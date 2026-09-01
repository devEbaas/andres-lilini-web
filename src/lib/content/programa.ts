import {
  ESCOLARIDAD,
  NIVELES,
  PAISES,
  PIES,
  POSICIONES,
  POSICIONES_SEC,
  PARENTESCOS,
  TURNOS,
} from "./jugador";

/**
 * Estructura del formulario del programa.
 *
 * Aquí queda lo que define el control —clave, tipo, opciones, obligatoriedad,
 * ancho— y nada de texto. Rótulos, marcadores de posición y ayudas viven en
 * `messages/*.json`, bajo `programa`, direccionados por la clave del campo.
 *
 * Las `options` son los valores que se guardan, no lo que se lee: los CHECK de
 * las migraciones los fijan en español. La etiqueta traducida sale de `vocab`
 * usando el propio valor como clave. Cambiarlos aquí obliga a una migración.
 */

export const PROGRAMA_INTRO = [
  { n: "01", key: "evaluamos" },
  { n: "02", key: "tarda" },
  { n: "03", key: "menores" },
];

/** Los quince atributos de la rúbrica, en orden. Los textos, en `programa.rubric`. */
export const RUBRIC = [
  "velocidad",
  "fuerza",
  "pase",
  "golpeo",
  "atletismo",
  "iq",
  "defensa",
  "mecanica",
  "ofensivo",
  "consistencia",
  "liderazgo",
  "aprender",
  "pasion",
  "mental",
  "etica",
] as const;

// `clubes` es el único que no es un control suelto: renderiza el
// repetidor del historial. Ver `ApplyForm`.
export type FieldType = "text" | "email" | "tel" | "date" | "number" | "select" | "radio" | "area" | "check" | "clubes";

export type ApplyField = {
  key: string;
  type: FieldType;
  wide?: boolean;
  options?: string[];
  required?: boolean;
  /** Sólo se muestra si quien se postula es menor de edad hoy. */
  soloMenores?: boolean;
  /** Obligatorio cuando se muestra a un menor. */
  requiredIfMenor?: boolean;
};

export type ApplyStep = { key: string; fields: ApplyField[] };

export const APPLY_STEPS: ApplyStep[] = [
  {
    key: "identidad",
    fields: [
      { key: "nombre", type: "text", wide: true, required: true },
      { key: "nac", type: "date", required: true },
      { key: "pais", type: "select", options: PAISES },
      { key: "nacionalidad", type: "text" },
      { key: "estado", type: "text" },
      { key: "ciudad", type: "text" },
      { key: "email", type: "email", required: true },
      { key: "tel", type: "tel" },
    ],
  },
  {
    key: "perfil",
    fields: [
      { key: "estatura", type: "number" },
      { key: "peso", type: "number" },
      { key: "pos1", type: "select", options: POSICIONES },
      { key: "pos2", type: "select", options: POSICIONES_SEC },
      { key: "pie", type: "radio", options: PIES },
      { key: "equipo", type: "text" },
      { key: "liga", type: "text" },
      { key: "anios", type: "number" },
      { key: "nivel", type: "select", options: NIVELES },
      { key: "dt", type: "text", wide: true },
      { key: "clubes", type: "clubes", wide: true },
    ],
  },
  {
    key: "video",
    fields: [
      { key: "video", type: "text", wide: true, required: true },
      { key: "premios", type: "area", wide: true },
      { key: "stats", type: "area", wide: true },
      { key: "fortalezas", type: "text", wide: true },
      { key: "links", type: "text", wide: true },
    ],
  },
  {
    key: "medibles",
    fields: [
      { key: "vel", type: "number" },
      { key: "salto", type: "number" },
      { key: "yoyo", type: "text" },
      { key: "fuerza", type: "number" },
      { key: "viaje", type: "radio", options: ["Sí", "Con apoyo", "No"] },
      { key: "reubic", type: "radio", options: ["Sí", "A evaluar", "No"] },
      { key: "desde", type: "date" },
      { key: "hasta", type: "date" },
    ],
  },
  {
    key: "estudios",
    fields: [
      { key: "escolaridad", type: "select", options: ESCOLARIDAD, required: true },
      { key: "estudia", type: "radio", options: ["Sí", "No"], required: true },
      { key: "turno", type: "select", options: TURNOS },
      { key: "escuela", type: "text", wide: true },
    ],
  },
  {
    key: "consentimientos",
    fields: [
      { key: "tutor", soloMenores: true, type: "text", wide: true, requiredIfMenor: true },
      { key: "tutorTel", soloMenores: true, type: "tel", requiredIfMenor: true },
      { key: "parentesco", soloMenores: true, type: "select", options: PARENTESCOS, requiredIfMenor: true },
      { key: "tutorEmail", soloMenores: true, type: "email", requiredIfMenor: true },
      { key: "okPriv", type: "check", wide: true },
      { key: "okVerdad", type: "check", wide: true },
      { key: "okTutor", soloMenores: true, type: "check", wide: true, requiredIfMenor: true },
    ],
  },
];
