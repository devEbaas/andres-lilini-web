export type Route = { label: string; href: string };

export const NAV: Route[] = [
  { label: "Inicio", href: "/" },
  { label: "Trayectoria", href: "/#trayectoria" },
  { label: "Tienda", href: "/tienda" },
  { label: "Programa", href: "/programa" },
  { label: "Convocatoria", href: "/convocatoria" },
  { label: "Fundación", href: "/fundacion" },
  { label: "Sistema", href: "/sistema" },
];

export const SOCIAL = ["IG", "X", "YT", "IN"] as const;

export const CHANNELS = [
  { k: "Prensa", v: "prensa@andreslillini.com" },
  { k: "Programa", v: "atletas@andreslillini.com" },
  { k: "Pedidos", v: "tienda@andreslillini.com" },
  { k: "Instagram", v: "@andreslillini" },
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
    title: "Explorar",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Trayectoria", href: "/#trayectoria" },
      { label: "Tienda", href: "/tienda" },
      { label: "Sistema", href: "/sistema" },
    ],
  },
  {
    title: "Programa",
    links: [
      { label: "Programa de atletas", href: "/programa" },
      { label: "Convocatoria", href: "/convocatoria" },
      { label: "Fundación", href: "/fundacion" },
      { label: "Preguntas frecuentes", href: "/contenido/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso de privacidad", href: "/contenido/privacidad" },
      { label: "Términos", href: "/contenido/terminos" },
      { label: "Bases de la convocatoria", href: "/contenido/bases" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Escríbenos", href: "/contacto" },
      { label: "Prensa", href: "/contenido/prensa" },
      { label: "Patrocinios", href: "/contenido/patrocinios" },
    ],
  },
];

export const SHIPPING_MXN = 120;
