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

export const CAMPAIGNS = [
  { status: "En curso", title: "Canchas de barrio", photo: "Foto 4:3 · cancha comunitaria rehabilitada", body: "Rehabilitación de superficies y porterías en clubes comunitarios de tres estados, con dotación de material y capacitación al entrenador local." },
  { status: "En curso", title: "Visorías sin costo", photo: "Foto 4:3 · fila de jugadores en visoría", body: "Jornadas gratuitas de detección en municipios sin representación en ligas formativas. Transporte y comida cubiertos para el jugador y un acompañante." },
  { status: "Abierta", title: "Formación para entrenadores", photo: "Foto 4:3 · aula con entrenadores", body: "Curso presencial de metodología formativa para entrenadores de escuelas y ligas municipales, con seguimiento a distancia durante un año." },
  { status: "Piloto", title: "Beca académica paralela", photo: "Foto 4:3 · jugador estudiando", body: "Apoyo escolar obligatorio para todo becado del programa: sin avance académico no hay continuidad deportiva." },
];

export const CONVOCATORIA_BRIEF = [
  { n: "01", title: "Qué pedimos", body: "Un video de juego de cinco a ocho minutos y una carta de una página: quién eres, dónde juegas y qué necesitas para seguir." },
  { n: "02", title: "Requisitos técnicos", body: "PDF, JPG, PNG o MP4 de hasta 25 MB. Si tu video pesa más, comparte un enlace público en el campo correspondiente." },
  { n: "03", title: "Cómo se elige", body: "Tres evaluadores del programa califican potencial deportivo, contexto y compromiso académico. Lista corta el 15 de diciembre." },
];

export const CONVOCATORIA_CHECKS = [
  { k: "bases", label: "Acepto las bases de la convocatoria y el fallo del jurado.", requerido: true },
  { k: "priv", label: "Acepto el aviso de privacidad y el tratamiento de mis datos.", requerido: true },
  // Separado a propósito: evaluar el video y difundirlo son finalidades
  // distintas. Se debe poder aceptar lo primero y rechazar lo segundo.
  {
    k: "imagen",
    label: "Autorizo el uso de mi imagen y mi video en materiales del programa. Opcional: no afecta a la evaluación.",
    requerido: false,
  },
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
