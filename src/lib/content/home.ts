/**
 * Estructura de la portada.
 *
 * Aquí sólo vive lo que no es texto: cifras, rutas de imagen, proporciones y
 * el orden. La prosa está en `messages/*.json`, bajo `home`, direccionada por
 * la `key` de cada registro.
 */

export type Metric = { key: string; v: number; s: string };

export const METRICS: Metric[] = [
  { key: "evaluados", v: 1400, s: "+" },
  { key: "debutaron", v: 62, s: "+" },
  { key: "anios", v: 27, s: "" },
  { key: "partidos", v: 102, s: "" },
  { key: "paises", v: 4, s: "" },
];

export const CREDENTIALS = ["desde1998", "canteras", "selecciones"] as const;

export type Milestone = {
  /** Sirve de clave y de rótulo: el año no se traduce. */
  year: string;
  /** Ruta en /public cuando la fotografía ya está entregada. */
  image?: string;
};

export const TIMELINE: Milestone[] = [
  { year: "1998", image: "/images/cancha-barrio.jpeg" },
  { year: "2001", image: "/images/morelia.jpg" },
  { year: "2007", image: "/images/boca.webp" },
  { year: "2011", image: "/images/cska.jpeg" },
  { year: "2015", image: "/images/sudamerica.jpeg" },
  { year: "2018", image: "/images/pumas.jpg" },
  { year: "2020", image: "/images/director-pumas.jpg" },
  { year: "2023", image: "/images/mexico.png" },
];

export type GalleryItem = { key: string; span: string; ratio: string };

export const GALLERY: GalleryItem[] = [
  { key: "principal", span: "span 2", ratio: "4/3" },
  { key: "retrato", span: "span 1", ratio: "3/4" },
  { key: "detalle", span: "span 1", ratio: "3/4" },
  { key: "vestidor", span: "span 1", ratio: "1/1" },
  { key: "visorias", span: "span 1", ratio: "1/1" },
  { key: "panoramica", span: "span 4", ratio: "21/9" },
];

export const PILLARS = [
  { n: "01", key: "detectar" },
  { n: "02", key: "desarrollar" },
  { n: "03", key: "sostener" },
];
