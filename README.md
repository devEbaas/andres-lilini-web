# Andrés Lillini — sitio oficial

Implementación en producción del canvas de Claude Design
[`Andrés Lillini.dc.html`](https://claude.ai/design/p/74e0f595-677b-4cbb-9a05-e895350d525e?file=Andres+Lillini.dc.html).

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
| `/` | Hero, métricas animadas, trayectoria, archivo visual, metodología |
| `/programa` | Formulario de postulación en 5 secciones + rúbrica de 15 atributos |
| `/tienda` | Catálogo con filtro por categoría |
| `/tienda/[id]` | Ficha de producto (prerenderizada por `generateStaticParams`) |
| `/convocatoria` | Beca 2027: bases, formulario y carga de archivo |
| `/fundacion` | Campañas de impacto comunitario |
| `/contacto` | Formulario por tema + canales directos |
| `/contenido/[doc]` | Prensa, FAQ, patrocinios, privacidad, términos, bases |
| `/sistema` | Sistema de diseño: tokens, tipografía, componentes, tarjetas OG |
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

   `20260825173800_init.sql` crea las tablas, activa RLS y crea el bucket
   privado `convocatoria`. `20260825173900_seed_products.sql` carga el catálogo.
   Los nombres llevan marca de tiempo porque es el formato que exigen la CLI y
   la integración de GitHub: el historial de migraciones usa ese número como id.

   Si en su lugar despliegas desde GitHub, conecta el repositorio en
   **Project Settings › Integrations**, pon `.` en *Working directory* (el
   `supabase/` está en la raíz), elige la rama de producción y activa
   **Deploy to production**.

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

Los tokens del canvas (paleta oklch, sombras, gradiente de acento) viven en
`src/app/globals.css`: primero como custom properties en `:root` y
`[data-theme="light"]`, y después mapeados al `@theme` de Tailwind, de modo que
`bg-panel`, `text-muted`, `border-hairline` o `shadow-deep` resuelven a los
mismos valores. Cambiar `--accent` y `--accent-light` en `:root` retiñe el sitio
entero.

El tema claro está implementado y se activa poniendo `data-theme="light"` en
`<html>` (`src/app/layout.tsx`); todavía no hay control de usuario para
alternarlo. El selector ES/EN de la cabecera es parte del diseño original y hoy
sólo avisa de que la versión en inglés está pendiente.

### Movimiento

Todo el movimiento usa `motion/react` y respeta `prefers-reduced-motion`:

- `Reveal` — entrada escalonada por scroll (opacidad + desplazamiento + blur).
- `Counter` — conteo de las métricas al entrar en viewport.
- `Hero` — parallax de los halos con `useScroll` / `useTransform`.
- `ScrollProgress` — barra superior con `useSpring`.
- `RouteTransition` — fundido al cambiar de ruta. Va cifrado por `pathname`,
  no por URL completa, para no remontar la página en los enlaces de ancla
  (`#trayectoria`, `#form`, `#participar`).

### Fotografía

Las fotos aún no existen: `PhotoSlot` dibuja el marcador rayado del diseño con
la descripción del encuadre previsto. Sustituir por `next/image` cuando llegue
el material.

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # eslint
```
