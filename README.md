# Andrés Lillini — sitio oficial

Implementación en producción del canvas de Claude Design
[`Andrés Lillini Formal.dc.html`](https://claude.ai/design/p/74e0f595-677b-4cbb-9a05-e895350d525e?file=Andres+Lillini+Formal.dc.html)
— registro editorial sobre papel: serif Newsreader, filete de 1px, cero radios
y acento ocre.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Supabase.

---

## Arranque

```bash
npm install
cp .env.example .env.local   # opcional, ver "Supabase" más abajo
npm run dev                  # http://localhost:3000
```

El sitio arranca y es completamente navegable **sin Supabase**: el catálogo usa
los datos semilla de `src/lib/content/tienda.ts` y los formularios validan y
muestran su pantalla de éxito sin persistir nada. Al conectar Supabase, esas
mismas rutas pasan a leer y escribir de verdad, sin cambios en el código.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Hero, método de trabajo, cifras de gestión, tres vías de entrada |
| `/trayectoria` | Expediente cronológico (8 hitos) y archivo fotográfico |
| `/programa` | Formulario de postulación en 5 secciones + rúbrica de 15 atributos |
| `/tienda` | Catálogo con filtro por categoría |
| `/tienda/[id]` | Ficha de producto (prerenderizada por `generateStaticParams`) |
| `/convocatoria` | Beca 2027: bases, formulario y carga de archivo |
| `/fundacion` | Comunidad: campañas de impacto |
| `/contacto` | Correspondencia: directorio + formulario por tema |
| `/contenido/[doc]` | Prensa, FAQ, patrocinios, privacidad, términos, bases |
| `/sistema` | Normas gráficas: paleta, tipografía, componentes, tarjetas OG |
| — | `not-found.tsx` para el 404 |

## Supabase

1. Crea un proyecto y copia las credenciales a `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

2. Aplica las migraciones de `supabase/migrations/` en orden — desde el SQL
   editor del dashboard o con la CLI:

   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```

   `0001_init.sql` crea las tablas, activa RLS y crea el bucket privado
   `convocatoria`. `0002_seed_products.sql` carga el catálogo y
   `0003_products_formal_copy.sql` lo reescribe con los textos del rediseño
   (ambos son `upsert` sobre los mismos ids).

3. Regenera los tipos cuando cambies el esquema:

   ```bash
   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
   ```

### Modelo de datos

| Tabla | Escribe | Lee |
| --- | --- | --- |
| `products` | — (semilla) | público (RLS: `select` para `anon`) |
| `applications` | `submitApplication` | sólo service role |
| `convocatoria_entries` | `submitConvocatoria` | sólo service role |
| `contact_messages` | `submitContact` | sólo service role |
| `newsletter_subscribers` | `subscribe` | sólo service role |
| `orders` | `createOrder` | sólo service role |

`/tienda` y `/tienda/[id]` se prerenderizan con `revalidate = 300`, así que el
catálogo se sirve estático y se regenera cada cinco minutos. La lectura usa un
cliente anónimo sin cookies (`src/lib/supabase/public.ts`) precisamente para que
esas rutas no se vuelvan dinámicas al conectar Supabase.

### Seguridad

- RLS está activo en todas las tablas y la única policy pública es lectura de
  `products`. El navegador no puede leer ni escribir postulaciones, mensajes ni
  pedidos.
- Las escrituras pasan por Server Actions (`src/lib/actions/`) que usan la
  service role key, importada sólo desde módulos marcados con `server-only`.
- `createOrder` recalcula los importes con los precios del catálogo del
  servidor; nunca confía en los que manda el cliente.
- El bucket `convocatoria` es privado, con límite de 25 MB y MIME types
  restringidos a PDF, JPG, PNG y MP4. `next.config.ts` sube el
  `bodySizeLimit` de Server Actions a 26 MB para que quepa el archivo.

## Diseño

Los tokens del canvas (paleta oklch, filete, familias tipográficas) viven en
`src/app/globals.css`: primero como custom properties en `:root` y después
mapeados al `@theme` de Tailwind, de modo que `bg-surface`, `text-ink-soft`,
`border-rule` o `font-display` resuelven a los mismos valores. Cambiar
`--accent` en `:root` retiñe los epígrafes, los focos y los enlaces del sitio
entero.

El sistema es de un solo tema —papel claro—, sin gradientes ni sombras: la
jerarquía la marcan el filete de 1px, el peso tipográfico y el espacio. Todos
los controles tienen `border-radius: 0`. Las tres familias son Newsreader
(títulos), Libre Franklin (interfaz y texto) e IBM Plex Mono (datos, folios y
anotaciones), cargadas con `next/font/google` desde `layout.tsx`.

Las clases compartidas de botón, pestaña y casilla están en
`src/components/ui/styles.ts`; el ancho de caja (`.shell`, `.shell-nav`), el
epígrafe (`.eyebrow`), la etiqueta de campo (`.label-caps`) y el campo
(`.field`) son componentes de `globals.css`.

### Movimiento

Todo el movimiento usa `motion/react` y respeta `prefers-reduced-motion`:

- `Reveal` — entrada escalonada por scroll: 10px de desplazamiento y opacidad,
  0.7s, con 0.06s de retardo por hermano (hasta 6).
- `Counter` — conteo de las cifras de gestión al entrar en viewport (1.2s).
- `RouteTransition` — fundido de 0.4s al cambiar de ruta. Va cifrado por
  `pathname`, no por URL completa, para no remontar la página en los enlaces de
  ancla (`#form`, `#participar`).
- `CartDrawer`, `MobileMenu`, `FaqList` — apertura y cierre con
  `AnimatePresence`.

### Fotografía

Las fotos aún no existen: `PhotoSlot` dibuja el marcador del diseño —caja con
filete y el encuadre previsto en mono— con la proporción real de la pieza
(`4/5`, `16/10`, `21/9`…). Sustituir por `next/image` cuando llegue el
material.

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # eslint
```
