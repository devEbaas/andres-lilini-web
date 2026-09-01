/**
 * Paridad de claves entre catálogos de mensajes.
 *
 * `messages/es.json` es la fuente de verdad. Este chequeo falla si el inglés
 * pierde una clave o inventa una que no existe, que es como se degrada un
 * sitio bilingüe: nadie borra una traducción a propósito, se olvida al añadir
 * una cadena nueva y sólo se nota cuando alguien navega en el otro idioma.
 *
 *   node scripts/check-messages.mjs
 */
import { readFileSync } from "node:fs";

const BASE = "es";
const OTROS = ["en"];

const leer = (l) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url)));

function claves(objeto, prefijo = "", salida = new Map()) {
  for (const [k, v] of Object.entries(objeto)) {
    const ruta = prefijo ? `${prefijo}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) claves(v, ruta, salida);
    else salida.set(ruta, v);
  }
  return salida;
}

/**
 * Los marcadores ICU tienen que sobrevivir a la traducción.
 *
 * Sólo cuentan los argumentos del nivel superior. Dentro de un `plural` las
 * llaves delimitan texto humano —`one {Carrito, # artículo}`— y confundirlas
 * con marcadores haría fallar cualquier mensaje con plurales.
 */
function marcadores(valor) {
  if (typeof valor !== "string") return "";
  const args = [];
  let profundidad = 0;

  for (let i = 0; i < valor.length; i++) {
    const c = valor[i];
    if (c === "}") profundidad--;
    else if (c === "{") {
      if (profundidad === 0) {
        const nombre = /^\{\s*([A-Za-z0-9_]+)\s*[,}]/.exec(valor.slice(i));
        if (nombre) args.push(nombre[1]);
      }
      profundidad++;
    }
  }
  return args.sort().join(",");
}

const base = claves(leer(BASE));
let fallos = 0;

for (const locale of OTROS) {
  const otro = claves(leer(locale));

  const faltan = [...base.keys()].filter((k) => !otro.has(k));
  const sobran = [...otro.keys()].filter((k) => !base.has(k));
  const rotos = [...base.keys()].filter(
    (k) => otro.has(k) && marcadores(base.get(k)) !== marcadores(otro.get(k)),
  );

  for (const [titulo, lista] of [
    [`faltan en ${locale}`, faltan],
    [`sobran en ${locale}`, sobran],
    [`marcadores distintos en ${locale}`, rotos],
  ]) {
    if (!lista.length) continue;
    fallos += lista.length;
    console.error(`\n✗ ${lista.length} ${titulo}:`);
    for (const k of lista.slice(0, 40)) console.error(`    ${k}`);
    if (lista.length > 40) console.error(`    …y ${lista.length - 40} más`);
  }

  if (!faltan.length && !sobran.length && !rotos.length) {
    console.log(`✓ ${locale}: ${otro.size} claves, idénticas a ${BASE}`);
  }
}

process.exit(fallos ? 1 : 0);
