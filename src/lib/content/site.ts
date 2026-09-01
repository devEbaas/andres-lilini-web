import type { ComponentProps } from "react";

import type { Link } from "@/i18n/navigation";

/**
 * Un enlace de navegación.
 *
 * `href` se escribe en su forma interna —la ruta en español— y `Link` la
 * traduce al idioma activo. El tipo es exactamente el que acepta `Link`, así
 * que un destino inexistente no compila y las rutas con parámetros exigen los
 * suyos. Es `import type`: se borra al compilar y no arrastra React aquí.
 */
export type Route = { label: string; href: ComponentProps<typeof Link>["href"] };

export const NAV: Route[] = [
  { label: "Inicio", href: "/" },
  { label: "Trayectoria", href: { pathname: "/", hash: "#trayectoria" } },
  { label: "Tienda", href: "/tienda" },
  { label: "Programa", href: "/programa" },
  { label: "Convocatoria", href: "/convocatoria" },
  { label: "Fundación", href: "/fundacion" },
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
      { label: "Trayectoria", href: { pathname: "/", hash: "#trayectoria" } },
      { label: "Tienda", href: "/tienda" },
    ],
  },
  {
    title: "Programa",
    links: [
      { label: "Programa de atletas", href: "/programa" },
      { label: "Convocatoria", href: "/convocatoria" },
      { label: "Fundación", href: "/fundacion" },
      { label: "Preguntas frecuentes", href: { pathname: "/contenido/[doc]", params: { doc: "faq" } } },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso de privacidad", href: { pathname: "/contenido/[doc]", params: { doc: "privacidad" } } },
      { label: "Términos", href: { pathname: "/contenido/[doc]", params: { doc: "terminos" } } },
      { label: "Bases de la convocatoria", href: { pathname: "/contenido/[doc]", params: { doc: "bases" } } },
      { label: "Ejercer tus derechos", href: "/derechos" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Escríbenos", href: "/contacto" },
      { label: "Prensa", href: { pathname: "/contenido/[doc]", params: { doc: "prensa" } } },
      { label: "Patrocinios", href: { pathname: "/contenido/[doc]", params: { doc: "patrocinios" } } },
    ],
  },
];

export const SHIPPING_MXN = 120;
