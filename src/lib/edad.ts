/**
 * Cálculo de edad, compartido por los dos formularios.
 *
 * Hay dos fechas de referencia distintas y no son intercambiables:
 *
 *   · **Elegibilidad** se mide al cierre de la convocatoria. Es la regla que
 *     fijan las bases, y usar «hoy» haría que el mismo jugador entrara o no
 *     según el día en que abriera el formulario.
 *
 *   · **Minoría de edad** se mide hoy, en el momento del envío. Es cuando se
 *     recogen los datos y se otorga el consentimiento: quien tiene 17 años al
 *     enviar es menor aunque cumpla 18 la semana siguiente.
 */
export function edadEn(nacimiento: string, referencia: string | Date): number | null {
  const nace = new Date(`${nacimiento}T00:00:00Z`);
  if (Number.isNaN(nace.getTime())) return null;

  const ref =
    typeof referencia === "string" ? new Date(`${referencia}T00:00:00Z`) : referencia;
  if (Number.isNaN(ref.getTime())) return null;

  let edad = ref.getUTCFullYear() - nace.getUTCFullYear();
  const meses = ref.getUTCMonth() - nace.getUTCMonth();
  if (meses < 0 || (meses === 0 && ref.getUTCDate() < nace.getUTCDate())) edad -= 1;

  return edad;
}

export const MAYORIA_DE_EDAD = 18;

/**
 * ¿Es menor de edad en el momento del envío?
 *
 * Ante una fecha ilegible devuelve `true`: si no se puede demostrar que es
 * mayor, se le trata como menor. Equivocarse hacia el lado protector cuesta
 * un campo de más; hacia el otro, saltarse el consentimiento del tutor.
 */
export function esMenorHoy(nacimiento: string): boolean {
  const edad = edadEn(nacimiento, new Date());
  if (edad === null) return true;
  return edad < MAYORIA_DE_EDAD;
}
