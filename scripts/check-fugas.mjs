/**
 * Busca español que se haya colado en las páginas en inglés.
 *
 * Los otros chequeos miran el código; éste mira lo que sale servido, que es lo
 * único que ve una persona. Coge cada cadena del catálogo español que **debería**
 * ser distinta en inglés y la busca en el HTML de las páginas inglesas: si
 * aparece tal cual, es que algo no se tradujo o el componente no pide la clave.
 *
 * Necesita el sitio levantado.
 *
 *   npm run build && npm run start &
 *   node scripts/check-fugas.mjs [http://localhost:3000]
 */
import { readFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";

const leer = (l) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url)));

function aplanar(objeto, prefijo = "", salida = new Map()) {
  for (const [k, v] of Object.entries(objeto)) {
    const ruta = prefijo ? `${prefijo}.${k}` : k;
    if (v && typeof v === "object") aplanar(v, ruta, salida);
    else salida.set(ruta, v);
  }
  return salida;
}

const es = aplanar(leer("es"));
const en = aplanar(leer("en"));

/**
 * Sólo interesan las cadenas que cambian de idioma y son largas: las cortas
 * («ES», «01», «IMSS») coinciden por ser iguales en ambos, no por un fallo.
 * Los mensajes con marcadores ICU salen del catálogo con `{algo}` dentro y
 * nunca aparecen literales en el HTML, así que también quedan fuera.
 */
const VIGILADAS = [...es.entries()].filter(([clave, valor]) => {
  if (typeof valor !== "string" || valor.length < 12) return false;
  if (valor === en.get(clave)) return false;
  if (/[{<]/.test(valor)) return false;
  // El panel y el sistema de diseño son monolingües por decisión.
  return !/^(meta\.(admin|sistema))/.test(clave);
});

/** Las rutas inglesas que sirven contenido. */
const RUTAS = [
  "/en",
  "/en/store",
  "/en/store/p1",
  "/en/store/p3",
  "/en/program",
  "/en/tryouts",
  "/en/foundation",
  "/en/contact",
  "/en/privacy-rights",
  "/en/signup",
  "/en/login",
  "/en/reset-password",
  "/en/content/prensa",
  "/en/content/faq",
  "/en/content/patrocinios",
  "/en/content/privacidad",
  "/en/content/terminos",
  "/en/content/bases",
];

function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

const fugas = [];

for (const ruta of RUTAS) {
  const res = await fetch(BASE + ruta);
  if (!res.ok) {
    fugas.push({ ruta, clave: "—", texto: `la ruta respondió ${res.status}` });
    continue;
  }
  const texto = visible(await res.text());

  for (const [clave, valor] of VIGILADAS) {
    if (texto.includes(valor.replace(/\s+/g, " "))) {
      fugas.push({ ruta, clave, texto: valor.slice(0, 80) });
    }
  }
}

console.log(`\nBuscando ${VIGILADAS.length} cadenas españolas en ${RUTAS.length} páginas inglesas\n`);

if (fugas.length) {
  console.error(`✗ ${fugas.length} fugas de español:\n`);
  for (const f of fugas) {
    console.error(`    ${f.ruta}  ←  ${f.clave}`);
    console.error(`      ${f.texto}`);
  }
  console.error("");
  process.exit(1);
}

console.log("✓ ninguna cadena española aparece en el sitio en inglés\n");
