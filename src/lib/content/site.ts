export type Route = { label: string; href: string };

/** Índice completo del sitio: menú compacto, pie y página 404. */
export const NAV: Route[] = [
  { label: "Inicio", href: "/" },
  { label: "Trayectoria", href: "/trayectoria" },
  { label: "Programa", href: "/programa" },
  { label: "Convocatoria", href: "/convocatoria" },
  { label: "Comunidad", href: "/fundacion" },
  { label: "Publicaciones", href: "/tienda" },
  { label: "Contacto", href: "/contacto" },
  { label: "Normas", href: "/sistema" },
];

/** Subconjunto que cabe en la barra de escritorio. */
const TOP = new Set([
  "Inicio",
  "Trayectoria",
  "Programa",
  "Convocatoria",
  "Publicaciones",
  "Contacto",
]);

export const NAV_TOP: Route[] = NAV.filter((n) => TOP.has(n.label));

/** Direcciones públicas; se repiten en el menú compacto y en el pie. */
export const EMAILS = ["prensa@andreslillini.com", "atletas@andreslillini.com"] as const;

export const CHANNELS = [
  { k: "Prensa", v: "prensa@andreslillini.com" },
  { k: "Programa", v: "atletas@andreslillini.com" },
  { k: "Pedidos", v: "tienda@andreslillini.com" },
  { k: "Oficina", v: "Ciudad de México" },
];

export const CONTACT_TOPICS = [
  "General",
  "Prensa y medios",
  "Patrocinios",
  "Tienda y pedidos",
  "Convocatoria",
  "Asesoría y entrenamiento",
] as const;

export const FOOTER_COLS: { title: string; links: Route[] }[] = [
  {
    title: "Sitio",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Trayectoria", href: "/trayectoria" },
      { label: "Publicaciones", href: "/tienda" },
      { label: "Normas gráficas", href: "/sistema" },
    ],
  },
  {
    title: "Programa",
    links: [
      { label: "Programa de atletas", href: "/programa" },
      { label: "Convocatoria", href: "/convocatoria" },
      { label: "Comunidad", href: "/fundacion" },
      { label: "Preguntas frecuentes", href: "/contenido/faq" },
    ],
  },
  {
    title: "Documentos",
    links: [
      { label: "Aviso de privacidad", href: "/contenido/privacidad" },
      { label: "Términos", href: "/contenido/terminos" },
      { label: "Bases de la convocatoria", href: "/contenido/bases" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Correspondencia", href: "/contacto" },
      { label: "Prensa", href: "/contenido/prensa" },
      { label: "Patrocinios", href: "/contenido/patrocinios" },
    ],
  },
];

export const SHIPPING_MXN = 120;
