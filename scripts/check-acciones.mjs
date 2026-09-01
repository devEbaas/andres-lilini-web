/**
 * Caza texto y URLs escritos en español dentro de las Server Actions.
 *
 * `check-literales` mira el JSX, que es donde se escribe casi todo. Pero una
 * acción también le habla a la persona —el mensaje de «lo recibimos»— y
 * también decide a qué URL vuelve —el `success_url` de Stripe, el enlace de
 * un correo, el `redirectTo` de Supabase—. Ahí no hay JSX, así que aquello no
 * llegaba, y cuatro frases y siete rutas se quedaron en español: quien
 * compraba en inglés volvía al sitio en español.
 *
 * Dos reglas:
 *
 *   1. Ninguna cadena larga de prosa. Lo que lee una persona va en
 *      `messages/`, y la acción devuelve la clave.
 *   2. Ninguna ruta del mapa escrita a mano detrás de `siteUrl()`. Se arma
 *      con `rutaCon(interna, locale)`, que sabe traducir el slug y poner el
 *      prefijo.
 *
 *   node scripts/check-acciones.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const MIRAR = ["src/lib/actions"];

/**
 * El primer segmento de cada ruta del mapa, sacado del propio `routing.ts`
 * para que la lista no se quede atrás cuando alguien añada una ruta.
 *
 * El segmento y no la clave entera: lo que delata a una URL escrita a mano es
 * `/tutor/…`, y la clave es `/tutor/[token]`. Comparar contra la clave no
 * casaba nunca, y el chequeo pasaba con el fallo delante.
 *
 * `/admin` y `/sistema` quedan fuera: son monolingües por decisión, así que
 * escribirlas en español es lo correcto.
 */
const SOLO_ES = ["admin", "sistema"];
const SEGMENTOS = new Set(
  [...readFileSync(join(RAIZ, "src/i18n/routing.ts"), "utf8").matchAll(/"\/([a-z-]+)[/"]/g)]
    .map((m) => m[1])
    .filter((s) => !SOLO_ES.includes(s)),
);

/** Quita comentarios y los `console.*`, que ni se leen ni se traducen. */
function limpiar(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/console\.\w+\([^)]*\)/g, "");
}

function archivos(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else if (ruta.endsWith(".ts")) salida.push(ruta);
  }
  return salida;
}

/**
 * ¿Es una frase para una persona, o un identificador?
 *
 * Las acciones están llenas de cadenas que no se leen: nombres de columna,
 * valores de un CHECK (`"iniciado"`, `"cliente"`), claves de traducción,
 * rutas de `revalidatePath`. Todas van sin espacios o con uno; la prosa de
 * este sitio no baja de tres palabras y termina en punto.
 */
function pareceProsa(texto) {
  if (texto.length < 25) return false;
  if ((texto.match(/ /g) ?? []).length < 3) return false;
  // Una plantilla con `${}` dentro se arma en tiempo de ejecución: no es una
  // frase suelta, y si lleva texto será el que ya venga traducido.
  if (texto.includes("${")) return false;
  return /[a-záéíóúñ] [a-záéíóúñ]/.test(texto);
}

const hallazgos = [];

for (const base of MIRAR) {
  for (const ruta of archivos(join(RAIZ, base))) {
    const rel = relative(RAIZ, ruta);
    const bruto = readFileSync(ruta, "utf8");
    const lineas = bruto.split("\n");
    const s = limpiar(bruto);

    const anota = (texto, motivo) => {
      const aguja = texto.slice(0, 30);
      const linea = lineas.findIndex((l) => l.includes(aguja));
      if (linea >= 0 && lineas[linea].includes("i18n-ok")) return;
      hallazgos.push({ archivo: rel, linea: linea + 1, motivo, texto: texto.slice(0, 90) });
    };

    // 1. Prosa suelta en vez de una clave del catálogo.
    for (const m of s.matchAll(/"([^"\n]{25,})"/g)) {
      if (pareceProsa(m[1])) anota(m[1], "frase fuera del catálogo");
    }

    // 2. Una ruta del mapa pegada a mano detrás de la base del sitio.
    //
    // Contra `${…}` y no contra `siteUrl()`: en `checkout.ts` la base va en
    // una variable —`${base}/tienda/gracias`— y buscar la llamada dejaba
    // pasar justo el caso que rompía la vuelta de Stripe.
    for (const m of s.matchAll(/\$\{[^{}]*\}\/([a-z-]+)/g)) {
      if (SEGMENTOS.has(m[1])) anota(m[0], "ruta española escrita a mano");
    }

    // 3. Lo mismo dentro de un `next=` de Supabase, que va como parámetro.
    for (const m of s.matchAll(/next=\/([a-z-]+)/g)) {
      if (SEGMENTOS.has(m[1])) anota(m[0], "ruta española escrita a mano");
    }
  }
}

if (hallazgos.length) {
  console.error(`\n✗ ${hallazgos.length} hallazgos en las Server Actions:\n`);
  for (const h of hallazgos) {
    console.error(`    ${h.archivo}:${h.linea}  ${h.motivo}`);
    console.error(`      ${h.texto}`);
  }
  console.error("\n  Las frases van a messages/ y la acción devuelve la clave (ver AvisoKey).");
  console.error("  Las URLs se arman con rutaCon(interna, locale), de @/i18n/rutas.\n");
  process.exit(1);
}

console.log("✓ acciones: ni frases sueltas ni rutas españolas escritas a mano");
