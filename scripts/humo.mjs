/**
 * Repaso de humo del sitio bilingüe, contra un servidor ya levantado.
 *
 * Automatiza la parte del repaso previo al despliegue que no necesita sesión
 * ni pasarela de pago: rutas, idioma del documento, `hreflang` recíproco,
 * redirecciones que conservan el idioma y el selector.
 *
 *   npm run build && npm run start &
 *   node scripts/humo.mjs [http://localhost:3000]
 */
const BASE = process.argv[2] ?? "http://localhost:3000";

let fallos = 0;
let pasadas = 0;

function comprobar(nombre, condicion, detalle = "") {
  if (condicion) {
    pasadas++;
  } else {
    fallos++;
    console.error(`  ✗ ${nombre}${detalle ? `\n      ${detalle}` : ""}`);
  }
}

const traer = async (ruta) => {
  const res = await fetch(BASE + ruta, { redirect: "manual" });
  return { estado: res.status, destino: res.headers.get("location"), cuerpo: await res.text() };
};

/** Las 22 rutas del mapa, en sus dos formas. */
const PARES = [
  ["/", "/en"],
  ["/tienda", "/en/store"],
  ["/tienda/p1", "/en/store/p1"],
  ["/programa", "/en/program"],
  ["/convocatoria", "/en/tryouts"],
  ["/fundacion", "/en/foundation"],
  ["/contacto", "/en/contact"],
  ["/derechos", "/en/privacy-rights"],
  ["/registro", "/en/signup"],
  ["/recuperar", "/en/reset-password"],
  ["/contenido/faq", "/en/content/faq"],
  ["/contenido/privacidad", "/en/content/privacidad"],
];

console.log(`\nRepaso de humo contra ${BASE}\n`);

// ── Rutas ─────────────────────────────────────────────────────
console.log("Rutas");
for (const [es, en] of PARES) {
  for (const ruta of [es, en]) {
    const { estado } = await traer(ruta);
    comprobar(`${ruta} responde 200 sin redirect`, estado === 200, `dio ${estado}`);
  }
}

// ── Idioma del documento ──────────────────────────────────────
console.log("Idioma del documento");
for (const [es, en] of PARES) {
  const a = await traer(es);
  const b = await traer(en);
  comprobar(`${es} declara lang="es"`, a.cuerpo.includes('<html lang="es"'));
  comprobar(`${en} declara lang="en"`, b.cuerpo.includes('<html lang="en"'));
}

// ── hreflang recíproco ────────────────────────────────────────
console.log("hreflang");
for (const [es, en] of PARES) {
  for (const ruta of [es, en]) {
    const { cuerpo } = await traer(ruta);
    const alternos = [...cuerpo.matchAll(/hrefLang="([a-z-]+)" href="([^"]+)"/g)].map((m) => m[1]);
    comprobar(
      `${ruta} declara es, en y x-default`,
      ["es", "en", "x-default"].every((l) => alternos.includes(l)),
      `encontrados: ${alternos.join(", ") || "ninguno"}`,
    );
  }
}

// ── El selector conserva la página ────────────────────────────
console.log("Selector de idioma");
for (const [es, en] of PARES) {
  for (const [ruta, esperados] of [
    [es, [es, en]],
    [en, [es, en]],
  ]) {
    const { cuerpo } = await traer(ruta);
    const anclas = [...cuerpo.matchAll(/<a [^>]*aria-label="(?:Español|English)"[^>]*>/g)]
      .map((m) => /href="([^"]+)"/.exec(m[0])?.[1])
      .filter(Boolean);
    comprobar(
      `desde ${ruta} lleva a ${esperados.join(" y ")}`,
      esperados.every((e) => anclas.includes(e)),
      `encontrados: ${anclas.join(", ") || "ninguno"}`,
    );
  }
}

// ── Rutas internas: sólo español ──────────────────────────────
console.log("Rutas internas");
for (const ruta of ["/en/sistema", "/en/admin", "/en/admin/pedidos"]) {
  const { estado } = await traer(ruta);
  comprobar(`${ruta} responde 404`, estado === 404, `dio ${estado}`);
}
{
  const { cuerpo } = await traer("/sistema");
  comprobar("/sistema no ofrece el selector", !cuerpo.includes('aria-label="English"'));
}

// ── Sesión: el redirect conserva el idioma ────────────────────
console.log("Sesión");
for (const [ruta, esperado] of [
  ["/cuenta", "/login?next=%2Fcuenta"],
  ["/en/account", "/en/login?next=%2Fen%2Faccount"],
  ["/cuenta/pedidos", "/login?next=%2Fcuenta%2Fpedidos"],
]) {
  const { estado, destino } = await traer(ruta);
  comprobar(
    `${ruta} manda al acceso en su idioma`,
    estado === 307 && (destino ?? "").endsWith(esperado),
    `${estado} → ${destino}`,
  );
}

// ── Slugs sin traducir: redirigen al canónico ─────────────────
console.log("Canónicos");
for (const [ruta, esperado] of [
  ["/en/tienda", "/en/store"],
  ["/en/programa", "/en/program"],
  ["/es/tienda", "/tienda"],
]) {
  const { estado, destino } = await traer(ruta);
  comprobar(
    `${ruta} redirige a ${esperado}`,
    estado === 307 && (destino ?? "").endsWith(esperado),
    `${estado} → ${destino}`,
  );
}

// ── Rutas que quedan fuera del proxy ──────────────────────────
console.log("Fuera del proxy");
for (const [ruta, estados] of [
  ["/favicon.ico", [200]],
  ["/images/logo.png", [200]],
  ["/auth/callback", [307]],
]) {
  const { estado } = await traer(ruta);
  comprobar(`${ruta} no lo toca el proxy`, estados.includes(estado), `dio ${estado}`);
}

// ── Sitemap ───────────────────────────────────────────────────
console.log("Sitemap");
{
  const { cuerpo } = await traer("/sitemap.xml");
  const urls = [...cuerpo.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  comprobar("lista las dos versiones de cada ruta", urls.length >= PARES.length * 2, `${urls.length} URLs`);
  comprobar("usa los slugs traducidos", urls.some((u) => u.endsWith("/en/store")));
  comprobar("no incluye rutas privadas", !urls.some((u) => /\/(login|cuenta|admin|sistema)/.test(u)));
}

console.log(`\n${fallos ? "✗" : "✓"} ${pasadas} comprobaciones pasadas, ${fallos} fallidas\n`);
process.exit(fallos ? 1 : 0);
