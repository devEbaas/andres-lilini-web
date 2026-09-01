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
| `/en/…` | Las mismas rutas en inglés, con slug traducido — ver «Idiomas» |
| — | `not-found.tsx` para el 404 |

## Supabase

El esquema se despliega con la **CLI**, fijada como dependencia de desarrollo
para que todos usen la misma versión. Los comandos viven en `package.json`.

1. Crea el proyecto y copia las credenciales a `.env.local` (o `.env`; ambos
   están en `.gitignore`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=      # panel nuevo: "Publishable key"
   SUPABASE_SERVICE_ROLE_KEY=          # panel nuevo: "Secret key"
   ```

   Las dos primeras llegan al navegador; la tercera no sale del servidor
   —`admin.ts` está marcado con `server-only`—.

2. Autentica la CLI y enlaza el proyecto. Los dos son interactivos: el primero
   abre el navegador, el segundo pide la contraseña de la base de datos.

   ```bash
   npx supabase login
   npm run db:link
   ```

3. Aplica las migraciones:

   ```bash
   npm run db:push
   ```

   `20260825173800_init.sql` crea las tablas, activa RLS y crea el bucket
   privado `convocatoria`. `20260825173900_seed_products.sql` carga el catálogo.
   Los nombres llevan marca de tiempo porque es el formato que exige la CLI: el
   historial de `supabase_migrations.schema_migrations` usa ese número como id
   único y las aplica en ese orden.

4. Regenera los tipos cuando cambie el esquema:

   ```bash
   npm run db:types
   ```

   Ojo: `src/lib/supabase/types.ts` está escrito a mano y es más legible que la
   salida de la CLI. Regenerarlo lo sustituye entero. No rompe nada —fuera del
   archivo sólo se importa `Database`—, pero se pierden los alias intermedios.

### Despliegue automático

`.github/workflows/deploy-migrations.yml` aplica las migraciones al empujar a
`main`, y sólo cuando cambia algo bajo `supabase/`. Necesita tres secretos en
**Settings › Secrets and variables › Actions**:

| Secreto | De dónde sale |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Account settings › Access Tokens |
| `SUPABASE_DB_PASSWORD` | la contraseña de la base del proyecto |
| `SUPABASE_PROJECT_ID` | el ref del proyecto (`cwtiokhjyclexedugjmb`) |

`.github/workflows/validate-migrations.yml` corre en cada PR: levanta una base
limpia y aplica todas las migraciones desde cero. Es el check que conviene
exigir en **Settings › Rules › Rulesets** para que un SQL inválido no llegue a
`main`. Aparecerá en el selector de checks después de su primera ejecución.

Mientras no estén los secretos, el workflow de despliegue falla; el de
validación funciona sin ninguno.

### Cambios de esquema

La regla es no tocar la base remota a mano: en cuanto se usan migraciones, un
cambio hecho desde el SQL editor deja el historial desincronizado y `db push`
empieza a fallar. Para cada cambio:

```bash
npx supabase migration new descripcion_del_cambio   # crea el archivo con marca de tiempo
npm run db:push
```

`npm run db:diff` muestra la diferencia entre el esquema local y el remoto sin
aplicar nada.

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

> **Estado:** esto es una demo para enseñar al cliente; el contenido es de
> relleno y nada está productivo. Lo que falta para lanzarlo de verdad está en
> [`docs/PARA-PRODUCCION.md`](docs/PARA-PRODUCCION.md).

## Idiomas

El sitio es bilingüe. **El español vive en la raíz y el inglés bajo `/en`**, con
los slugs traducidos: `/tienda` ↔ `/en/store`, `/convocatoria` ↔ `/en/tryouts`.
Ninguna URL en español cambió al añadir el inglés.

El mapa de rutas está en `src/i18n/routing.ts` y es la única fuente de verdad:
de ahí salen los enlaces, el `hreflang`, el sitemap y el selector. Los `href` se
escriben siempre en su forma interna —la ruta en español, que es como se llaman
las carpetas— y `Link` los traduce.

```
src/i18n/
  routing.ts     el mapa de rutas y los idiomas
  navigation.ts  Link, redirect, usePathname conscientes del idioma
  request.ts     qué catálogo se carga en cada petición
  rutas.ts       traducción de rutas sin React (proxy y servidor)
  servidor.ts    fijarIdioma() y localeActual()
  metadata.ts    título, canonical, hreflang y Open Graph
messages/
  es.json        catálogo maestro
  en.json        misma forma, otro idioma
```

`el idioma lo decide la URL`, sin cookie ni `Accept-Language`
(`localeDetection: false`). Así una misma URL sirve siempre el mismo contenido,
que es lo que mantiene cacheable un sitio mayoritariamente estático. La
contrapartida: quien elige inglés y vuelve al dominio pelado aterriza en
español.

### Reglas al escribir código

- **Nada de texto en el JSX.** Va a `messages/es.json` y `messages/en.json`.
  `npm run check:literales` lo comprueba; una línea con un nombre propio se
  exime con `i18n-ok` en un comentario.
- **`fijarIdioma()` al principio de cada page y layout.** Sin eso next-intl
  resuelve el idioma leyendo una cabecera y la página se vuelve dinámica.
- **Las Server Actions no pueden resolver el idioma.** Llega como dato del
  formulario y se filtra con `normalizaLocale`. Decide en qué lengua se
  escribe, nunca un permiso.
- **Los errores de las acciones son claves, no frases.** `ErrorKey` sale del
  propio `es.json`, así que una clave inexistente no compila.
- **Lo que se guarda no se traduce.** Posiciones, categorías, parentescos y
  temas de contacto van a la base con su valor canónico; sólo la etiqueta
  cambia de idioma, desde el espacio `vocab`.

### Qué se queda en español

`/admin` y `/sistema` son internos y monolingües por decisión. Pedidos en otro
idioma redirigen al español —no responden 404: el panel existe, sólo que en una
lengua— y no muestran el selector.

Los tres documentos legales —privacidad, términos y bases— se publican en
inglés con un aviso visible de que son traducción de cortesía y de que sólo el
original en español vincula. **No sustituye a la revisión de quien redactó el
aviso de privacidad**: están redactados con cuidado, pero recogen
consentimientos de tutores de menores bajo la LFPDPPP.

Los correos de Supabase Auth son el único punto que no se resuelve desde el
código: ver `docs/correos-supabase/`.

### Comprobaciones

```bash
npm run check       # paridad de catálogos, literales sueltos, catálogo semilla
npm run humo        # 112 comprobaciones contra un servidor levantado
```

Las tres primeras corren en cada PR (`.github/workflows/verificar.yml`). El
repaso de humo necesita `npm run build && npm run start` y se lanza a mano
antes de desplegar.

## Diseño

Los tokens del canvas (paleta oklch, sombras, gradiente de acento) viven en
`src/app/globals.css`: primero como custom properties en `:root` y
`[data-theme="light"]`, y después mapeados al `@theme` de Tailwind, de modo que
`bg-panel`, `text-muted`, `border-hairline` o `shadow-deep` resuelven a los
mismos valores. Cambiar `--accent` y `--accent-light` en `:root` retiñe el sitio
entero.

El tema claro está implementado y se activa poniendo `data-theme="light"` en
`<html>` (`src/app/[lang]/layout.tsx`); todavía no hay control de usuario para
alternarlo. El selector ES/EN de la cabecera ya cambia de idioma conservando la
página: ver «Idiomas» más arriba.

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
npm run check   # catálogos de idioma: paridad, literales sueltos, semilla
npm run humo    # repaso del sitio bilingüe contra un servidor levantado
```
