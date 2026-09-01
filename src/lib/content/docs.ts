/**
 * Estructura de las páginas de contenido.
 *
 * Aquí sólo quedan el slug —que es parte de la URL y no se traduce—, el tipo
 * de página y el orden de las secciones. Rótulos, títulos y prosa viven en
 * `messages/*.json`, bajo `docs`, direccionados por esas mismas claves.
 */

export type Doc = {
  slug: string;
  kind: "prose" | "faq";
  /** Claves de las secciones, en el orden en que se muestran. */
  sections?: string[];
};

export const DOCS: Doc[] = [
  {
    slug: "prensa",
    kind: "prose",
    sections: ["bio", "datos", "materiales", "entrevistas"],
  },
  {
    slug: "faq",
    kind: "faq",
  },
  {
    slug: "patrocinios",
    kind: "prose",
    sections: ["ofrecemos", "formatos", "noHacemos", "siguiente"],
  },
  {
    slug: "privacidad",
    kind: "prose",
    sections: [
      "responsable",
      "datos",
      "menores",
      "consentimientoTutor",
      "finalidades",
      "conservacion",
      "encargados",
      "derechos",
      "conCuenta",
    ],
  },
  {
    slug: "terminos",
    kind: "prose",
    sections: ["uso", "pagos", "envios", "propiedad"],
  },
  {
    slug: "bases",
    kind: "prose",
    sections: ["quien", "como", "criterios", "premio", "calendario"],
  },
];

/**
 * Documentos con efecto legal, redactados bajo la LFPDPPP mexicana.
 *
 * Su versión en inglés es una traducción de cortesía: se publica con un aviso
 * visible de que sólo el original en español vincula. Traducir un
 * consentimiento puede cambiar su alcance, y estos formularios recogen datos
 * de menores y autorizaciones de tutores.
 */
export const DOCS_LEGALES = ["privacidad", "terminos", "bases"];

export const DOC_SLUGS = DOCS.map((d) => d.slug);
export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);

/** Claves de las preguntas frecuentes, en orden. Los textos, en `docs.faq`. */
export const FAQ = [
  "edad",
  "costo",
  "video",
  "pedido",
  "devolucion",
  "propuestas",
  "datosMenor",
] as const;
