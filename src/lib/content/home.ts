export type Metric = { v: number; s: string; label: string };

export const METRICS: Metric[] = [
  { v: 1400, s: "+", label: "Jugadores evaluados en cantera" },
  { v: 62, s: "+", label: "Debutaron en primera división" },
  { v: 27, s: "", label: "Años formando futbolistas" },
  { v: 102, s: "", label: "Partidos dirigidos en Liga MX" },
  { v: 4, s: "", label: "Países con proyecto propio" },
];

export const METRICS_CUTOFF = "Corte a agosto de 2026";

export const PILLARS = [
  {
    n: "01",
    title: "Detectar",
    body: "Observar al jugador donde nadie mira: ligas municipales, torneos escolares y canteras sin estructura.",
  },
  {
    n: "02",
    title: "Desarrollar",
    body: "Plan individual medible por trimestre, con carga física, técnica y acompañamiento académico.",
  },
  {
    n: "03",
    title: "Sostener",
    body: "El debut no es la meta. Seguimiento de contrato, familia y salud mental durante los primeros tres años.",
  },
];

/** Las tres puertas de entrada al proyecto, en la portada. */
export const ACCESOS = [
  {
    n: "01",
    title: "Programa de atletas",
    body: "Solicitud de evaluación para jugadores de 12 a 21 años, con dictamen por escrito en quince días hábiles.",
    cta: "Ir al programa",
    href: "/programa",
  },
  {
    n: "02",
    title: "Beca de formación 2027",
    body: "Diez plazas con seguimiento metodológico, equipamiento y acompañamiento académico durante un año.",
    cta: "Ver convocatoria",
    href: "/convocatoria",
  },
  {
    n: "03",
    title: "Trabajo comunitario",
    body: "Visorías sin costo, canchas de barrio y formación para entrenadores de escuelas y ligas municipales.",
    cta: "Ver programa comunitario",
    href: "/fundacion",
  },
];
