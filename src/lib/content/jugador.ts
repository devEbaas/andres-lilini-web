/**
 * Vocabulario compartido del perfil de jugador.
 *
 * Vivía duplicado: las posiciones y los pies estaban escritos a mano en
 * `programa.ts` y otra vez en `fundacion.ts`, y los CHECK de la base los
 * repetían por tercera vez. Tres copias de la misma lista divergen en
 * cuanto alguien añade «Mediapunta» en un sitio y no en los otros.
 *
 * Si cambia algo de aquí, hay que cambiar también el CHECK correspondiente
 * en las migraciones. Es la única duplicación que queda, y es inevitable:
 * Postgres no puede importar TypeScript.
 */

export const POSICIONES = [
  "Portero",
  "Lateral",
  "Central",
  "Mediocentro",
  "Interior",
  "Extremo",
  "Delantero",
];

/** La secundaria admite «Ninguna»; la principal no. */
export const POSICIONES_SEC = ["Ninguna", ...POSICIONES];

export const PIES = ["Derecho", "Izquierdo", "Ambos"];

export const CATEGORIAS = ["Sub-13", "Sub-15", "Sub-17", "Sub-20", "Libre"];

export const NIVELES = [
  "Liga local",
  "Liga estatal",
  "Liga nacional juvenil",
  "Cantera profesional",
  "Selección estatal",
  "Selección nacional",
];

export const PARENTESCOS = ["Padre", "Madre", "Tutor legal"];

// ── Contexto académico ────────────────────────────────────────
// Las bases dicen que el jurado califica «compromiso académico» y la
// campaña de beca es explícita: sin avance académico no hay continuidad
// deportiva. Hasta ahora no se preguntaba nada de esto.

export const ESCOLARIDAD = [
  "Primaria",
  "Secundaria",
  "Preparatoria o bachillerato",
  "Universidad",
  "No estudia actualmente",
];

/** Determina si el jugador puede entrenar por la mañana o por la tarde. */
export const TURNOS = ["Matutino", "Vespertino", "Mixto", "No aplica"];

// ── Residencia ────────────────────────────────────────────────

export const PAISES = ["México", "Otro"];

export const ESTADOS_MX = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango",
  "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco",
  "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
  "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
];

/** Cuántos clubes admite el historial. Más de esto es ruido, no señal. */
export const MAX_CLUBES = 5;
