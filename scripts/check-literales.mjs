/**
 * Caza texto escrito a mano en la superficie bilingüe.
 *
 * La extracción de la fase 2 sirve de poco si dentro de tres sprints alguien
 * añade `<p>Enviar</p>` directamente en el JSX: el sitio en inglés se degrada
 * en silencio y no se nota hasta que alguien navega en el otro idioma. Este
 * chequeo falla si aparece texto visible fuera de `messages/`.
 *
 * Sólo mira los archivos que tienen que ser bilingües. `/admin` y `/sistema`
 * son internos y monolingües por decisión, así que quedan fuera.
 *
 * Para el caso legítimo —un nombre propio, una marca— se marca la línea con
 * `i18n-ok` en un comentario.
 *
 *   node scripts/check-literales.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const MIRAR = ["src/app/[lang]", "src/components"];
const FUERA = ["/admin/", "/sistema/", "/admin.", "/sistema."];

/** Atributos cuyo valor lee una persona. */
const ATRIBUTOS = ["aria-label", "placeholder", "title", "alt", "label", "hint", "texto", "cuerpo"];

/** Nombres propios y marcas: no se traducen y no tienen por qué estar en el catálogo. */
const PERMITIDO = new Set(["Andrés", "Lillini", "Andrés Lillini", "IG", "X", "YT", "IN"]);

function archivos(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else if (ruta.endsWith(".tsx")) salida.push(ruta);
  }
  return salida;
}

/** Quita lo que no es contenido: imports, comentarios, clases y estilos. */
function limpiar(s) {
  return s
    .replace(/^import[\s\S]*?from\s+"[^"]*";$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/className=("[^"]*"|\{[^}]*\})/g, "")
    .replace(/style=\{\{[^}]*\}\}/g, "");
}

/**
 * ¿Esto es una frase o es código?
 *
 * El `>` de un genérico —`useState<Errores>(`— y el de una comparación se
 * parecen al cierre de una etiqueta, así que el barrido los recoge igual. Se
 * descartan por su puntuación: la prosa de este sitio no lleva paréntesis,
 * llaves ni punto y coma, y si alguna vez los llevara ya estaría en el
 * catálogo. Un falso negativo aquí no cuesta nada; un falso positivo haría
 * que se ignorase el chequeo entero.
 */
const PALABRAS_CODIGO = /^(else|catch|finally|try|do|async|await|as|from|default)$/;

function pareceProsa(texto) {
  // Puntuación que no aparece en la prosa del sitio pero sí en cualquier
  // fragmento de código.
  if (/[;={}()[\]`$]|=>|\bconst\b|\breturn\b|\buseState\b/.test(texto)) return false;

  // Los dos puntos delatan una anotación de tipo o una clave de objeto
  // —`: LayoutProps`, `, openGraph:`—. La prosa con dos puntos de este sitio
  // ya está en el catálogo, así que perderla no cuesta nada.
  if (texto.includes(":")) return false;

  // Una frase empieza por letra, cifra o signo de apertura; un fragmento
  // cortado por una llave empieza por coma o punto.
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9¿¡«"'—]/.test(texto)) return false;

  return !PALABRAS_CODIGO.test(texto);
}

const hallazgos = [];

for (const base of MIRAR) {
  for (const ruta of archivos(join(RAIZ, base))) {
    const rel = relative(RAIZ, ruta);
    if (FUERA.some((f) => `/${rel}`.includes(f))) continue;

    const bruto = readFileSync(ruta, "utf8");
    const lineas = bruto.split("\n");
    const s = limpiar(bruto);

    const sospechas = [
      // Texto suelto entre etiquetas: <p>Enviar</p>.
      //
      // Una expresión también hace de frontera, no sólo una etiqueta: en
      // `<p>Texto suelto {t("x")}</p>` la frase queda entre `>` y `{`, y
      // mirar sólo `>…<` la dejaría pasar. Es la forma más común de que se
      // cuele un literal, porque nace de editar un párrafo ya traducido.
      ...[...s.matchAll(/[>}]\s*([^<>{}\n][^<>{}]*?)\s*[<{]/g)].map((m) => m[1]),
      // Atributos que lee una persona: `label="Enviar"`.
      ...[...s.matchAll(new RegExp(`(?:${ATRIBUTOS.join("|")})=("[^"]{2,}")`, "g"))].map((m) =>
        m[1].slice(1, -1),
      ),
      // Y los mismos nombres como propiedad de objeto: `{ label: "Panel" }`.
      //
      // No es un caso raro: así se escriben los rótulos que dependen de una
      // condición, y así se coló «Panel» en la cabecera durante toda la
      // traducción sin que nadie lo viera.
      ...[...s.matchAll(new RegExp(`(?:${ATRIBUTOS.join("|")}):\\s*("[^"]{2,}")`, "g"))].map((m) =>
        m[1].slice(1, -1),
      ),
    ];

    for (const bruto2 of sospechas) {
      const texto = bruto2.trim().replace(/\s+/g, " ");

      // Al menos tres letras seguidas: descarta símbolos, números y separadores.
      if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3}/.test(texto)) continue;
      if (PERMITIDO.has(texto)) continue;
      if (!pareceProsa(texto)) continue;

      // La línea puede eximirse a mano cuando el literal es legítimo.
      const aguja = texto.slice(0, 24);
      const linea = lineas.findIndex((l) => l.replace(/\s+/g, " ").includes(aguja));
      if (linea >= 0 && lineas[linea].includes("i18n-ok")) continue;

      hallazgos.push({ archivo: rel, linea: linea + 1, texto: texto.slice(0, 90) });
    }
  }
}

if (hallazgos.length) {
  console.error(`\n✗ ${hallazgos.length} textos fuera del catálogo:\n`);
  for (const h of hallazgos) {
    console.error(`    ${h.archivo}:${h.linea}`);
    console.error(`      ${h.texto}`);
  }
  console.error(
    "\n  Muévelos a messages/es.json y messages/en.json, o marca la línea con `i18n-ok`",
  );
  console.error("  si es un nombre propio.\n");
  process.exit(1);
}

console.log("✓ literales: no hay texto visible fuera del catálogo");
