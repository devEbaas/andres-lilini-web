/**
 * El catálogo semilla y la migración tienen que decir lo mismo.
 *
 * `PRODUCTS_SEED` es el respaldo cuando Supabase no responde, y la migración
 * `20260901140000_catalogo_bilingue.sql` carga esos mismos textos en la base.
 * Es una duplicación deliberada —Postgres no importa TypeScript— y por eso
 * necesita vigilancia: si se separan, el sitio muestra un catálogo distinto
 * con la base conectada y sin ella, y nadie lo nota hasta que Supabase falla.
 *
 *   node scripts/check-catalogo.mjs
 */
import { readFileSync } from "node:fs";

const TS = new URL("../src/lib/content/tienda.ts", import.meta.url);
const SQL = new URL("../supabase/migrations/20260901140000_catalogo_bilingue.sql", import.meta.url);

const CAMPOS = ["name", "sub", "shot", "desc"];

/** Los bloques `en: { … }` de cada producto de la semilla. */
function desdeSeed(fuente) {
  const productos = new Map();
  const bloque = /id:\s*"(p\d+)"[\s\S]*?en:\s*\{([\s\S]*?)\n\s{4}\},/g;

  for (const [, id, cuerpo] of fuente.matchAll(bloque)) {
    const fila = {};
    for (const campo of CAMPOS) {
      const m = new RegExp(`${campo}:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(cuerpo);
      if (!m) throw new Error(`semilla ${id}: falta el campo "${campo}" en inglés`);
      fila[campo] = m[1];
    }
    productos.set(id, fila);
  }
  return productos;
}

/** Las tuplas `('pN', name, sub, shot, description)` del bloque VALUES. */
function desdeSql(fuente) {
  const productos = new Map();
  const tupla = /\(\s*'(p\d+)',\s*((?:'(?:[^']|'')*',?\s*){4})\)/g;

  for (const [, id, cuerpo] of fuente.matchAll(tupla)) {
    const textos = [...cuerpo.matchAll(/'((?:[^']|'')*)'/g)].map((m) => m[1].replace(/''/g, "'"));
    if (textos.length !== 4) throw new Error(`migración ${id}: se esperaban 4 textos, hay ${textos.length}`);
    productos.set(id, Object.fromEntries(CAMPOS.map((c, i) => [c, textos[i]])));
  }
  return productos;
}

const seed = desdeSeed(readFileSync(TS, "utf8"));
const sql = desdeSql(readFileSync(SQL, "utf8"));

// Una extracción vacía o a medias pasaría inadvertida y volvería inútil el
// chequeo: mejor fallar aquí que dar un visto bueno que no vale nada.
if (seed.size === 0 || sql.size === 0) {
  console.error(`✗ extracción vacía (semilla: ${seed.size}, migración: ${sql.size})`);
  process.exit(1);
}

const fallos = [];

for (const id of new Set([...seed.keys(), ...sql.keys()])) {
  const a = seed.get(id);
  const b = sql.get(id);
  if (!a) fallos.push(`${id}: está en la migración pero no en la semilla`);
  else if (!b) fallos.push(`${id}: está en la semilla pero no en la migración`);
  else {
    for (const campo of CAMPOS) {
      if (a[campo] !== b[campo]) {
        fallos.push(`${id}.${campo}:\n      semilla:   ${a[campo]}\n      migración: ${b[campo]}`);
      }
    }
  }
}

if (fallos.length) {
  console.error(`\n✗ ${fallos.length} diferencias entre la semilla y la migración:`);
  for (const f of fallos) console.error(`    ${f}`);
  process.exit(1);
}

console.log(`✓ catálogo: ${seed.size} productos, textos en inglés idénticos en semilla y migración`);
