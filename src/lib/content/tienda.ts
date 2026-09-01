import type { Locale } from "@/i18n/routing";

export const CAT_KEYS = ["metodologia", "indumentaria", "equipamiento", "accesorios"] as const;
export type CatKey = (typeof CAT_KEYS)[number];

/** `todo` es el filtro sin filtrar, no una categoría del catálogo. */
export const CATEGORIES = ["todo", ...CAT_KEYS] as const;

/** Un producto ya resuelto al idioma de la petición. Es lo que ve la vista. */
export type Product = {
  id: string;
  /** Clave estable de categoría. El rótulo vive en `store.categorias`. */
  catKey: CatKey;
  name: string;
  sub: string;
  price: number;
  shot: string;
  desc: string;
  out?: boolean;
  /**
   * El nombre en los dos idiomas.
   *
   * Lo necesita el carrito: guarda sus líneas en `localStorage` y se llenan
   * con el idioma que hubiera al añadir. Sin esto, quien mete un producto
   * navegando en español y cambia a inglés sigue viendo «Libro: Cantera
   * primero» en su bolsa.
   */
  nombres: Record<Locale, string>;
};

/** Los cuatro campos que cambian con el idioma. */
type Textos = { name: string; sub: string; shot: string; desc: string };

export type Semilla = {
  id: string;
  catKey: CatKey;
  price: number;
  out?: boolean;
  es: Textos;
  en: Textos;
};

/**
 * Catálogo semilla y respaldo.
 *
 * Espeja las filas de `products` en Supabase: la migración
 * `20260901140000_catalogo_bilingue.sql` carga estos mismos textos en inglés.
 * Si cambias uno, cambia el otro — el sitio tiene que verse igual con la base
 * conectada y sin ella.
 */
export const PRODUCTS_SEED: Semilla[] = [
  {
    id: "p1",
    catKey: "metodologia",
    price: 480,
    es: {
      name: "Cuaderno de sesión",
      sub: "120 sesiones planificables",
      shot: "Producto · cuaderno cerrado sobre mesa",
      desc: "Cuaderno de trabajo con la estructura de sesión que usamos en cantera: objetivo, tarea, carga, correcciones y evaluación individual. Papel de 100 g, cosido, resiste el campo.",
    },
    en: {
      name: "Session notebook",
      sub: "120 plannable sessions",
      shot: "Product · closed notebook on a table",
      desc: "Working notebook with the session structure we use in the academy: objective, task, load, corrections and individual assessment. 100 gsm paper, sewn binding, survives the pitch.",
    },
  },
  {
    id: "p2",
    catKey: "metodologia",
    price: 650,
    es: {
      name: "Libro: Cantera primero",
      sub: "Método de formación, 288 páginas",
      shot: "Producto · libro de tapa dura",
      desc: "Veintisiete años de trabajo formativo ordenados en un método: cómo detectar, cómo medir y cómo sostener a un jugador joven en tres países distintos.",
    },
    en: {
      name: "Book: Academy First",
      sub: "Development method, 288 pages",
      shot: "Product · hardback book",
      desc: "Twenty-seven years of development work organised into a method: how to scout, how to measure and how to sustain a young player across three different countries.",
    },
  },
  {
    id: "p3",
    catKey: "indumentaria",
    price: 1890,
    out: true,
    es: {
      name: "Chamarra de cuerpo técnico",
      sub: "Edición limitada, unisex",
      shot: "Producto · chamarra colgada",
      desc: "Tejido técnico repelente al agua, corte recto, escudo bordado en el pecho. Tirada única de 300 piezas.",
    },
    en: {
      name: "Coaching staff jacket",
      sub: "Limited edition, unisex",
      shot: "Product · jacket on a hanger",
      desc: "Water-repellent technical fabric, straight cut, crest embroidered on the chest. Single run of 300 pieces.",
    },
  },
  {
    id: "p4",
    catKey: "indumentaria",
    price: 590,
    es: {
      name: "Playera de entrenamiento",
      sub: "Tejido transpirable",
      shot: "Producto · playera doblada",
      desc: "Playera de entrenamiento con tejido de secado rápido y logotipo serigrafiado. Tallas de niño a adulto XXL.",
    },
    en: {
      name: "Training shirt",
      sub: "Breathable fabric",
      shot: "Product · folded shirt",
      desc: "Training shirt in quick-drying fabric with a screen-printed logo. Sizes from junior to adult XXL.",
    },
  },
  {
    id: "p5",
    catKey: "indumentaria",
    price: 1240,
    es: {
      name: "Sudadera de campo",
      sub: "Algodón peinado 380 g",
      shot: "Producto · sudadera sobre fondo neutro",
      desc: "Sudadera de peso completo para trabajo en frío, con capucha forrada y bolsillo canguro.",
    },
    en: {
      name: "Field sweatshirt",
      sub: "380 g combed cotton",
      shot: "Product · sweatshirt on a neutral background",
      desc: "Full-weight sweatshirt for cold-weather work, with a lined hood and a kangaroo pocket.",
    },
  },
  {
    id: "p6",
    catKey: "equipamiento",
    price: 890,
    es: {
      name: "Set de conos y escalera",
      sub: "Kit de coordinación",
      shot: "Producto · kit desplegado",
      desc: "Doce conos, escalera de coordinación de cuatro metros y guía impresa con doce circuitos progresivos.",
    },
    en: {
      name: "Cone and ladder set",
      sub: "Coordination kit",
      shot: "Product · kit laid out",
      desc: "Twelve cones, a four-metre agility ladder and a printed guide with twelve progressive circuits.",
    },
  },
  {
    id: "p7",
    catKey: "equipamiento",
    price: 720,
    es: {
      name: "Balón de trabajo",
      sub: "Talla 5, cosido a máquina",
      shot: "Producto · balón sobre césped",
      desc: "Balón de entrenamiento de uso intensivo, con vejiga de látex y cámara reforzada.",
    },
    en: {
      name: "Training ball",
      sub: "Size 5, machine stitched",
      shot: "Product · ball on grass",
      desc: "Heavy-use training ball with a latex bladder and a reinforced carcass.",
    },
  },
  {
    id: "p8",
    catKey: "accesorios",
    price: 420,
    es: {
      name: "Gorra de cuerpo técnico",
      sub: "Ajuste trasero metálico",
      shot: "Producto · gorra de perfil",
      desc: "Gorra estructurada de seis paneles con bordado frontal y visera precurvada.",
    },
    en: {
      name: "Coaching staff cap",
      sub: "Metal rear closure",
      shot: "Product · cap in profile",
      desc: "Structured six-panel cap with front embroidery and a pre-curved brim.",
    },
  },
];

/** Aplana una fila semilla al idioma pedido. */
export function desdeSemilla(s: Semilla, locale: Locale): Product {
  const t = s[locale];
  return {
    id: s.id,
    catKey: s.catKey,
    price: s.price,
    out: s.out,
    nombres: { es: s.es.name, en: s.en.name },
    name: t.name,
    sub: t.sub,
    shot: t.shot,
    desc: t.desc,
  };
}

/** Claves de las miniaturas de la ficha. Los rótulos están en `store.thumbs`. */
export const PRODUCT_THUMBS = ["detalle1", "detalle2", "enUso"] as const;
