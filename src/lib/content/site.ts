import type { ComponentProps } from "react";

import type { Link } from "@/i18n/navigation";

/**
 * Un enlace de navegación.
 *
 * Sólo la estructura: `href` en su forma interna —la ruta en español, que
 * `Link` traduce al idioma activo— y `key`, que apunta al rótulo en
 * `messages/*.json` bajo el espacio `links`. El texto visible no vive aquí.
 *
 * El tipo de `href` es exactamente el que acepta `Link`: un destino
 * inexistente no compila y las rutas con parámetros exigen los suyos.
 */
export type Route = { key: string; href: ComponentProps<typeof Link>["href"] };

export const NAV: Route[] = [
  { key: "inicio", href: "/" },
  { key: "trayectoria", href: { pathname: "/", hash: "#trayectoria" } },
  { key: "tienda", href: "/tienda" },
  { key: "programa", href: "/programa" },
  { key: "convocatoria", href: "/convocatoria" },
  { key: "fundacion", href: "/fundacion" },
];

export const SOCIAL = ["IG", "X", "YT", "IN"] as const;

/** Los correos son datos, no copy: se quedan aquí y el rótulo va al JSON. */
export const CHANNELS = [
  { key: "prensa", email: "prensa@andreslillini.com" },
  { key: "programa", email: "atletas@andreslillini.com" },
  { key: "pedidos", email: "tienda@andreslillini.com" },
  { key: "instagram", email: "@andreslillini" },
];

/**
 * Temas del formulario de contacto.
 *
 * Son claves, no rótulos: el valor elegido viaja a `contact_messages.topic` y
 * tiene que significar lo mismo se haya enviado en español o en inglés. La
 * etiqueta que se ve vive en `contact.topics` del JSON, y el panel la traduce
 * de vuelta al mostrarla.
 */
export const CONTACT_TOPICS = [
  "general",
  "prensa",
  "patrocinios",
  "tienda",
  "convocatoria",
  "asesoria",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const FOOTER_COLS: { key: string; links: Route[] }[] = [
  {
    key: "explorar",
    links: [
      { key: "inicio", href: "/" },
      { key: "trayectoria", href: { pathname: "/", hash: "#trayectoria" } },
      { key: "tienda", href: "/tienda" },
    ],
  },
  {
    key: "programa",
    links: [
      { key: "programaAtletas", href: "/programa" },
      { key: "convocatoria", href: "/convocatoria" },
      { key: "fundacion", href: "/fundacion" },
      { key: "faq", href: { pathname: "/contenido/[doc]", params: { doc: "faq" } } },
    ],
  },
  {
    key: "legal",
    links: [
      { key: "privacidad", href: { pathname: "/contenido/[doc]", params: { doc: "privacidad" } } },
      { key: "terminos", href: { pathname: "/contenido/[doc]", params: { doc: "terminos" } } },
      { key: "bases", href: { pathname: "/contenido/[doc]", params: { doc: "bases" } } },
      { key: "derechos", href: "/derechos" },
    ],
  },
  {
    key: "contacto",
    links: [
      { key: "escribenos", href: "/contacto" },
      { key: "prensa", href: { pathname: "/contenido/[doc]", params: { doc: "prensa" } } },
      { key: "patrocinios", href: { pathname: "/contenido/[doc]", params: { doc: "patrocinios" } } },
    ],
  },
];

export const SHIPPING_MXN = 120;
