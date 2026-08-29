# Autenticación y control de acceso — plan de implementación

Plan para dos funcionalidades que comparten cimientos:

1. **Panel admin** (`/admin`) — acceso para el equipo. Lectura de pedidos, postulaciones, mensajes y archivos.
2. **Cuentas de cliente** (`/cuenta`) — registro, login y consulta del historial de pedidos.

Se construyen en ese orden. La fase 2 no reescribe nada de la fase 1: es el mismo `auth.users`, las mismas tablas y las mismas policies con un `using()` distinto.

> **Estado**: fase 1 completa, sin desplegar. Ver §10.
> Las migraciones **no se han podido validar en local** (no hay Docker ni Postgres en esta máquina): lo hará el workflow `Validar migraciones` al abrir el PR.

---

## 0. Contexto del que partimos

Lo que hay hoy, y que condiciona todas las decisiones:

| Hecho | Consecuencia |
|---|---|
| No hay autenticación de ningún tipo | Se construye desde cero, sin migrar usuarios existentes |
| RLS activo en todas las tablas, sin policies salvo lectura de `products` | `anon` ya está bloqueado por defecto. Bien: partimos de "todo denegado" |
| Todas las escrituras usan la service role key desde Server Actions | La service role **ignora RLS**. Es el riesgo central a acotar |
| `@supabase/ssr@0.12.5` ya está en `package.json`, sin usar | No hay que instalar nada |
| Next.js 16.3.3 | `middleware.ts` está deprecado y se llama `proxy.ts` |
| `orders` no tiene `user_id`; el checkout es de invitado | Hay que añadirlo **nullable** y resolver la vinculación por correo |
| Un solo proyecto de Supabase, sin staging | Las migraciones se prueban en local (`supabase db start`) antes de tocar `main` |
| El bucket `convocatoria` es privado | El panel necesitará signed URLs, y eso tiene su propia trampa |

---

## 1. Principios de seguridad

Cinco reglas que gobiernan todo lo que sigue. Si una decisión posterior las contradice, gana la regla.

### 1.1 La frontera real está en la base de datos

El control de acceso vive en las policies de RLS, no en el código de la aplicación. Un `if` mal escrito, una ruta que se te olvidó proteger o un `params` sin validar dejan de ser catastróficos cuando Postgres devuelve cero filas de todos modos.

Corolario: **el panel admin lee con el cliente autenticado del usuario, nunca con la service role.**

### 1.2 Tres capas, y sólo una es de verdad

```
proxy.ts        → chequeo optimista. Redirige. NO es seguridad.
DAL (servidor)  → verifica la sesión antes de renderizar. Defensa en profundidad.
RLS (Postgres)  → la frontera real. Lo que la base se niega a devolver.
```

Los docs de Next 16 son explícitos sobre la primera capa:

> Proxy is _not_ intended for slow data fetching. While Proxy can be helpful for optimistic checks such as permission-based redirects, it should not be used as a full session management or authorization solution.

El `proxy.ts` corre en cada navegación, incluidos los prefetch. Es para redirigir a `/login`, no para decidir quién ve qué.

### 1.3 Nunca confiar en datos que el usuario puede escribir

Dos trampas concretas, y son la misma:

- **`user_metadata` / `raw_user_meta_data`** lo edita el propio usuario desde el navegador con `supabase.auth.updateUser()`. Sirve para el nombre que se muestra. **Jamás para autorización.** Un `role` ahí es una puerta con la llave puesta por fuera.
- **`getSession()`** lee la cookie sin verificar la firma. El propio SDK lo advierte:

  > **IMPORTANT SECURITY NOTICE:** If using an insecure storage medium, such as cookies or request headers, the user object returned by this function **must not be trusted**.

  En el servidor se usa **`getClaims()`** (verifica la firma del JWT localmente) o `getUser()` (consulta al servidor de Auth). `getSession()` no se usa en decisiones de acceso, nunca.

### 1.4 El rol vive donde el usuario no escribe

Tabla `user_roles` separada de `profiles`, con `revoke all ... from authenticated, anon, public`. Sólo `supabase_auth_admin` la lee, para meter el rol en el JWT. La aplicación lee el rol del claim, no de la tabla.

Motivo: `profiles` **tiene** que ser editable por su dueño (cambiar nombre, teléfono). En cuanto existe esa policy de `update`, cualquier columna de autorización en esa tabla es autoservicio.

### 1.5 Denegar por defecto

Toda tabla nueva nace con `enable row level security` y sin policies. Se añaden una a una, cada una justificada. Ninguna policy usa `using (true)` para `authenticated`.

---

## 2. Modelo de datos

### 2.1 Reparto de responsabilidades

| Dato | Dónde vive | Quién escribe |
|---|---|---|
| Correo, contraseña (hash), confirmación, sesiones | `auth.users` (gestionado por Supabase) | Supabase Auth |
| Nombre, apellido, teléfono | `public.profiles` | El propio usuario |
| Rol, alta/baja | `public.user_roles` | Sólo service role |
| Vínculo pedido ↔ usuario | `public.orders.user_id` | Server Action / trigger |
| Acciones del panel | `public.admin_audit` | Sólo service role |

**No construimos una tabla de contraseñas.** El hashing con coste correcto, el rate limiting por cuenta e IP, los tokens de reset de un solo uso, la invalidación de sesiones al cambiar contraseña y la resistencia a timing attacks ya están en `auth.users`, probados y mantenidos. Reimplementarlos es donde se cometen los errores caros.

### 2.2 Migración `supabase/migrations/<ts>_auth_perfiles_roles.sql`

```sql
-- ─────────────────────────────────────────────────────────────
-- Perfiles, roles y el hook que mete el rol en el JWT
-- ─────────────────────────────────────────────────────────────

create type public.app_role as enum ('cliente', 'admin');

-- Datos personales. Editables por su dueño.
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  nombre     text        not null default '',
  apellido   text        not null default '',
  telefono   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Autorización. El usuario NO escribe aquí, ni lee.
create table public.user_roles (
  user_id    uuid primary key references auth.users on delete cascade,
  role       public.app_role not null default 'cliente',
  is_active  boolean         not null default true,
  created_at timestamptz     not null default now()
);

alter table public.profiles   enable row level security;
alter table public.user_roles enable row level security;
```

`is_active` va en `user_roles` y no en `profiles` precisamente por la regla 1.4: si estuviera en el perfil, un usuario dado de baja se reactivaría él solo con una petición desde la consola del navegador.

### 2.3 Alta automática de perfil

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre, apellido)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellido', '')
  );
  insert into public.user_roles (user_id, role, is_active)
  values (new.id, 'cliente', true);   -- SIEMPRE 'cliente'. Nunca desde el input.
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

Tres detalles que importan:

- **`set search_path = ''`** en toda función `security definer`. Sin esto, un usuario con permiso de crear objetos puede colocar una función homónima en un esquema que preceda en el `search_path` y hacer que tu función privilegiada ejecute su código. Es la escalada de privilegios clásica en Postgres.
- **El rol se escribe literal.** `raw_user_meta_data` viene del formulario de registro; si de ahí saliera el rol, cualquiera se registraría como admin.
- **`nombre` y `apellido` son datos de display.** Se validan y escapan al mostrarlos, pero nunca deciden nada.

### 2.4 Policies de `profiles`

```sql
create policy "perfil propio: leer" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "perfil propio: actualizar" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Cinturón y tirantes: aunque la policy dejara pasar un update,
-- estas columnas no existen para 'authenticated'.
revoke update on public.profiles from authenticated;
grant  update (nombre, apellido, telefono) on public.profiles to authenticated;
```

Sin policy de `insert` (lo hace el trigger) ni de `delete` (baja lógica vía `is_active`).

El `(select auth.uid())` envuelto en subconsulta no es cosmética: Postgres lo evalúa una vez por consulta en lugar de una vez por fila. En tablas grandes la diferencia es de órdenes de magnitud.

El `with check` es tan importante como el `using`: sin él, un usuario podría actualizar su fila para que deje de ser suya.

### 2.5 El rol en el JWT (auth hook)

Patrón oficial de Supabase para RBAC. Evita una subconsulta a `user_roles` en cada policy de cada fila.

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  v_role    public.app_role;
  v_active  boolean;
begin
  select role, is_active into v_role, v_active
  from public.user_roles
  where user_id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(v_role::text, 'cliente')));
  claims := jsonb_set(claims, '{is_active}', to_jsonb(coalesce(v_active, false)));

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- Sólo el servidor de Auth ejecuta el hook y lee la tabla.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant all on table public.user_roles to supabase_auth_admin;
revoke all on table public.user_roles from authenticated, anon, public;

create policy "auth admin lee roles" on public.user_roles
  as permissive for select to supabase_auth_admin
  using (true);
```

Activarlo después en `Authentication → Hooks` → *Custom Access Token* → `public.custom_access_token_hook`.

**`coalesce(v_active, false)`**: si no hay fila en `user_roles`, el usuario queda inactivo, no activo. Denegar por defecto también aquí.

### 2.6 Helper para las policies

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', '') = 'admin'
     and coalesce((auth.jwt() ->> 'is_active')::boolean, false)
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'is_active')::boolean, false)
$$;
```

No son `security definer` a propósito: sólo leen el JWT del propio llamante, así que no necesitan privilegios elevados. Menos superficie.

### 2.7 Policies de admin sobre los datos existentes

```sql
create policy "admin lee pedidos" on public.orders
  for select to authenticated using ((select public.is_admin()));

create policy "admin lee postulaciones" on public.applications
  for select to authenticated using ((select public.is_admin()));
create policy "admin actualiza postulaciones" on public.applications
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin lee convocatoria" on public.convocatoria_entries
  for select to authenticated using ((select public.is_admin()));

create policy "admin lee mensajes" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "admin marca mensajes" on public.contact_messages
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin lee boletin" on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));
```

Sin `delete` para nadie. Borrar se hace desde el SQL editor, deliberadamente incómodo.

### 2.8 Registro de acciones

```sql
create table public.admin_audit (
  id           bigint generated always as identity primary key,
  actor_id     uuid references auth.users on delete set null,
  actor_email  text,                      -- copia: sobrevive al borrado del usuario
  action       text not null,
  target_table text,
  target_id    text,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index admin_audit_created_at_idx on public.admin_audit (created_at desc);

alter table public.admin_audit enable row level security;

create policy "admin lee la auditoría" on public.admin_audit
  for select to authenticated using ((select public.is_admin()));
-- Sin policy de insert: escribe la service role desde las Server Actions.
```

Se registra: cambio de estado de una postulación, marcado de mensajes, generación de una signed URL sobre un archivo de convocatoria, cambio de rol y baja de usuario. No es burocracia: es lo único que responde "¿quién descargó esto?" cuando alguien lo pregunte.

---

## 3. Los clientes de Supabase en Next 16

Tres clientes, tres usos, y no son intercambiables.

| Archivo | Cliente | Clave | Para qué |
|---|---|---|---|
| `src/lib/supabase/browser.ts` | `createBrowserClient` | anon | Login/registro desde el formulario, estado de sesión en el header |
| `src/lib/supabase/server.ts` | `createServerClient` + cookies | anon | **Todas** las lecturas del panel y de la cuenta. Respeta RLS |
| `src/lib/supabase/admin.ts` (ya existe) | `createClient` | **service role** | Sólo escrituras públicas sin sesión: checkout, webhook, formularios |

La regla que no se rompe: **`admin.ts` no se importa desde `/admin` ni desde `/cuenta`.** Esas rutas leen con `server.ts`, y por tanto con RLS. La service role queda para el webhook de Stripe y los formularios anónimos, donde no hay usuario que autenticar.

### 3.1 `createServerClient` — la API correcta de la versión instalada

`@supabase/ssr@0.12.5` marca `get`/`set`/`remove` como deprecados. Hay que usar `getAll`/`setAll`, y el propio paquete advierte de lo que pasa si no:

> **IMPORTANT:** Failing to implement `getAll` and `setAll` correctly **will cause significant and difficult to debug authentication issues**: random logouts, early session termination, JSON parsing errors, increased refresh token requests, or relying on garbage state.

En un Server Component no se pueden escribir cookies. El `setAll` va en un `try/catch` vacío y **el refresco de sesión lo hace el proxy**. Si el proxy no está bien, las sesiones se caen solas y el bug es infernal de diagnosticar.

### 3.2 `src/proxy.ts` — refresco de sesión y chequeo optimista

En Next 16 el archivo es `proxy.ts` (en `src/`, al mismo nivel que `app/`), no `middleware.ts`. Dos responsabilidades:

1. **Refrescar el token** y escribir las cookies rotadas en la respuesta. Sin esto, las sesiones expiran a la hora.
2. **Redirigir** a `/login` lo que evidentemente no toca. Optimista, no autoritativo.

Tres reglas que evitan los fallos habituales:

- **No metas lógica entre `createServerClient()` y `getClaims()`.** Cualquier cosa en medio puede provocar cierres de sesión aleatorios.
- **Devuelve el objeto `NextResponse` tal cual.** Si creas uno nuevo, copia antes todas las cookies, o pierdes el token refrescado.
- **`matcher` que excluya estáticos y el webhook.** `/api/stripe/webhook` no debe pasar por aquí jamás: Stripe no trae cookies y no queremos ni un redirect ni una cookie de más en esa respuesta.

```ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}
```

### 3.3 `src/lib/auth/dal.ts` — la capa que sí verifica

```ts
import 'server-only'

// Verifica la firma del JWT. NUNCA getSession() para decidir accesos.
export async function getClaims()      // { sub, email, user_role, is_active } | null
export async function requireUser()    // redirect('/login?next=…') si no hay
export async function requireAdmin()   // redirect('/login') si user_role !== 'admin'
```

`import 'server-only'` en la primera línea: convierte en error de build cualquier import accidental desde un Client Component. El mismo patrón que ya usas en `admin.ts` y `stripe/client.ts`.

`requireAdmin()` se llama en `src/app/admin/layout.tsx`, que cubre todas las subrutas. Aun así, cada consulta va con el cliente autenticado: si el layout fallara, RLS sigue devolviendo cero filas.

### 3.4 El header estático

Detalle específico de este proyecto. `public.ts` evita cookies **a propósito** para que `/tienda` siga siendo estática. Si el header pasa a leer la sesión en el servidor, toda la tienda se vuelve dinámica y pierdes el prerender.

Solución: el enlace de "Mi cuenta" es un Client Component pequeño que resuelve la sesión en el navegador con `createBrowserClient`. El shell sigue estático y sólo ese fragmento se hidrata. Coste: un parpadeo mínimo en el primer render. Barato comparado con perder el prerender de la tienda entera.

---

## 4. Fase 1 — Panel admin

Objetivo: que dos personas entren a `/admin` y vean los datos. Sin registro público.

### 4.1 Pasos

1. Aplicar las migraciones de la sección 2 (2.2 a 2.8).
2. Activar el hook en `Authentication → Hooks`.
3. **Apagar el registro público** en `Authentication → Providers → Email` → *Allow new users to sign up* = off. Se reactiva en la fase 2.
4. Crear las dos cuentas a mano desde `Authentication → Users`, con contraseña generada por gestor.
5. Promoverlas, desde el SQL editor:
   ```sql
   update public.user_roles set role = 'admin'
   where user_id = (select id from auth.users where email = 'tu-correo@dominio.com');
   ```
6. **Cerrar sesión y volver a entrar.** El rol viaja en el JWT: el token viejo sigue diciendo `cliente` hasta que se renueve.
7. Código: `server.ts`, `browser.ts`, `proxy.ts`, `dal.ts`, `actions/auth.ts`, `/login`, `/admin/layout.tsx`.
8. Pantallas: pedidos, postulaciones, convocatoria, mensajes, boletín.

### 4.2 MFA para las cuentas admin

Supabase soporta MFA TOTP (`supabase.auth.mfa.enroll()`). Dos cuentas con acceso a las direcciones postales de todos los clientes justifican el segundo factor. Se puede exigir `aal2` en las policies de admin cuando esté enrolado.

Si se pospone, que sea una decisión consciente y anotada, no un olvido.

### 4.3 Archivos de convocatoria

El bucket es privado y así se queda. El panel genera signed URLs desde el servidor, **después** de verificar `is_admin()`, con TTL corto (60 s) y registrando en `admin_audit`.

La trampa: **una signed URL sigue siendo válida aunque cierres sesión.** Es un token al portador con vida propia. De ahí el TTL corto y el registro de quién la pidió.

---

## 5. Fase 2 — Cuentas de cliente

### 5.1 Requisito previo, no negociable

```toml
# supabase/config.toml
[auth.email]
enable_confirmations = true
```

Hoy está en `false`. Con confirmación obligatoria, **un usuario sin correo verificado no puede iniciar sesión**, y de ahí se deduce algo que usaremos enseguida: toda sesión autenticada tiene el correo verificado.

Sin esto, cualquiera se registra con el correo de otra persona y ve sus pedidos y su dirección. Es la diferencia entre una funcionalidad y una filtración.

### 5.2 Vincular pedidos

```sql
alter table public.orders
  add column user_id uuid references auth.users on delete set null;

create index orders_user_id_idx on public.orders (user_id);
create index orders_email_idx   on public.orders (lower(email));
```

**Nullable, y que siga siéndolo.** La mayoría de las ventas serán de invitados, y obligar a registrarse antes de pagar es la forma más eficaz de perder compras.

```sql
create policy "cliente lee sus pedidos" on public.orders
  for select to authenticated
  using (
    (select public.is_active_user())
    and (
      user_id = (select auth.uid())
      or (
        user_id is null
        and email is not null
        and lower(email) = lower((select auth.jwt() ->> 'email'))
      )
    )
  );
```

> ⚠️ **La segunda rama de este `or` sólo es segura mientras `enable_confirmations = true`.** Si alguien lo desactiva, se convierte en "escribe el correo de cualquiera y mira sus pedidos". Queda anotado en el propio archivo de migración, no sólo aquí.

Mejor aún: en el primer login, una Server Action vincula los pedidos huérfanos de ese correo verificado (`update orders set user_id = … where user_id is null and lower(email) = …`) y a partir de ahí manda la primera rama, que no depende de nada externo.

### 5.3 Pantallas

- `/registro` — nombre, apellido, correo, contraseña. Validación en el servidor.
- `/login` — con `?next=` validado (ver 6.6).
- `/cuenta` — perfil editable.
- `/cuenta/pedidos` — historial, leyendo con el cliente autenticado.
- `/recuperar` y `/cuenta/password`.
- `/auth/callback` — Route Handler con `exchangeCodeForSession` para los enlaces de confirmación y de reset.

### 5.4 Datos personales

Guardamos direcciones postales, correos y teléfonos de personas físicas en México: aplica la LFPDPPP.

- Aviso de privacidad enlazado desde el registro.
- Un camino real para ejercer derechos ARCO (acceso, rectificación, cancelación, oposición). Un correo de contacto documentado basta al principio; que exista.
- Borrado de cuenta: `delete from auth.users` cascadea a `profiles` y `user_roles`. **`orders` no debe cascadear** — de ahí el `on delete set null`: la contabilidad y la obligación fiscal sobreviven a la cuenta.

---

## 6. Configuración de Supabase

### 6.1 `config.toml` — cambios necesarios

`config.toml` configura **el stack local**, no producción. Los mismos valores hay que ponerlos aparte en el dashboard; son dos configuraciones distintas y se olvida la mitad de las veces. Por eso `site_url` se queda apuntando a localhost aquí.

```toml
[auth]
site_url = "http://127.0.0.1:3000"    # local. El de producción va en el dashboard
additional_redirect_urls = ["http://127.0.0.1:3000", "http://localhost:3000"]
jwt_expiry = 3600
enable_refresh_token_rotation = true
enable_signup = false                 # true al abrir la fase 2
minimum_password_length = 12          # hoy 6
password_requirements = "lower_upper_letters_digits"

[auth.email]
enable_confirmations = true           # hoy false
secure_password_change = true         # hoy false: exige reautenticación
max_frequency = "60s"                 # hoy 1s: evita bombardeo de correo
```

`secure_password_change = true` cierra el escenario del portátil desbloqueado: sin la contraseña actual no se puede cambiar la contraseña.

`max_frequency = "1s"` permite usar tu formulario para inundar el buzón de un tercero. Sesenta segundos.

Y el hook, que en local va por archivo y en producción por dashboard:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

### 6.2 URL Configuration en el dashboard

`Authentication → URL Configuration`. Es una **lista blanca de destinos de redirección**; sin ella, los enlaces de confirmación y de reset se pueden dirigir a un dominio ajeno y el token acaba en manos de otro.

- Site URL: el dominio de producción.
- Redirect URLs: sólo lo necesario. Ojo con los preview de Vercel, que cambian de URL en cada deploy — si los necesitas, usa un patrón acotado, no un comodín abierto.

### 6.3 SMTP propio

El remitente por defecto de Supabase va limitado (`email_sent = 2` por hora) y no es para producción. En cuanto haya registro público, la confirmación y el reset dejan de ser opcionales: sin correo, nadie entra.

Resend ya está en tu stack. Dominio verificado con SPF, DKIM y DMARC, o los correos van a spam y el soporte se convierte en "no me llegó nada".

### 6.4 Captcha

`Authentication → Attack Protection` → hCaptcha o Turnstile, en registro, login y reset. Es lo que separa un formulario de un objetivo de credential stuffing. El `sign_in_sign_ups = 30` por 5 minutos por IP ayuda, pero una botnet tiene muchas IPs.

### 6.5 Contraseñas filtradas

`Authentication → Policies` ofrece comprobación contra HaveIBeenPwned. Actívalo si tu plan lo incluye: rechaza en el registro las contraseñas que ya están en volcados públicos, que es de donde salen la mayoría de los accesos no autorizados.

### 6.6 Redirección abierta en `?next=`

El `?next=` del login es un vector de phishing si se acepta tal cual: `/login?next=https://sitio-falso.com` te devuelve al atacante después de iniciar sesión, con toda la apariencia de legitimidad.

Regla: aceptar sólo rutas relativas que empiecen por `/` y no por `//`. Todo lo demás, a `/`.

---

## 7. Checklist de seguridad

Repasar antes de cada merge a `main`.

**Fronteras**
- [ ] Ninguna ruta de `/admin` o `/cuenta` importa `admin.ts` (service role)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sin prefijo `NEXT_PUBLIC_`, y `import 'server-only'` en todo lo que la toca
- [ ] Toda tabla nueva nace con RLS activo y sin policies
- [ ] Ninguna policy usa `using (true)` para `authenticated`
- [ ] Todo `for update` lleva `with check`, no sólo `using`

**Identidad**
- [ ] Cero `getSession()` en decisiones de acceso — sólo `getClaims()` o `getUser()`
- [ ] El rol sale del claim del JWT, nunca de `user_metadata`
- [ ] `user_roles` con `revoke all ... from authenticated, anon, public`
- [ ] Toda función `security definer` con `set search_path = ''`
- [ ] El trigger de alta escribe `'cliente'` literal, nunca desde el input

**Configuración**
- [ ] `enable_confirmations = true` antes de abrir el registro
- [ ] Registro público apagado durante la fase 1
- [ ] Redirect URLs en lista blanca, sin comodines abiertos
- [ ] `minimum_password_length >= 12` y `password_requirements` puesto
- [ ] Captcha en registro, login y reset
- [ ] SMTP propio verificado (SPF/DKIM/DMARC)

**Aplicación**
- [ ] `?next=` sólo acepta rutas relativas
- [ ] Signed URLs con TTL corto y registro en `admin_audit`
- [ ] Ni tokens ni correos completos en `console.log` (los logs de Vercel los guarda y los lee cualquiera con acceso al proyecto)
- [ ] Mensajes de error genéricos en login y reset: "si el correo existe, te enviamos…" — decir "ese correo no está registrado" es un oráculo de enumeración de cuentas
- [ ] El webhook de Stripe excluido del `matcher` del proxy

---

## 8. Lo que se va a romper, y por qué

Fallos previsibles. Anotarlos ahorra la tarde de depuración.

**"Cambié el rol y sigue sin ser admin."** El rol viaja en el JWT y el token vive una hora. Cerrar sesión y volver a entrar. Mismo motivo por el que `is_active = false` no expulsa a nadie al instante: hay que revocar además los refresh tokens desde el servidor. Para bajas de verdad, las dos cosas.

**"Se cierra la sesión sola, aleatoriamente."** Casi siempre el `proxy.ts`: o no devuelve la respuesta tal cual, o hay lógica entre `createServerClient()` y `getClaims()`, o el `setAll` no escribe en la respuesta que se devuelve.

**"El panel no ve nada, pero el usuario es admin."** Estás leyendo con el cliente autenticado (correcto) y falta la policy, o el hook no está activado en el dashboard y el claim `user_role` no existe. Comprobar con `select auth.jwt();` en el SQL editor durante una sesión real.

**"La tienda dejó de ser estática."** Algo del header o del layout público está leyendo cookies. Revisar qué importa `server.ts` desde una ruta pública.

**"En local funciona y en producción no."** El hook se activa por proyecto desde el dashboard; en local va por `config.toml`. Son dos configuraciones distintas y hay que tocar las dos.

---

## 9. Orden de despliegue

Sin entorno de staging, el orden es la única red de seguridad.

```
1. supabase db start            # base limpia, migraciones desde cero
2. Probar policies en local con usuarios reales de prueba
3. PR → workflow "Validar migraciones" en verde
4. Merge a main → "Desplegar migraciones" + build de Vercel
5. Activar el hook en el dashboard de producción
6. Crear las cuentas admin y promoverlas
7. Verificar: un usuario cliente NO ve /admin ni lee orders
```

El paso 7 es la prueba que importa, y hay que hacerla de verdad: con una cuenta `cliente` real, intentar `select * from orders` desde el cliente autenticado y confirmar que devuelve cero filas. Que el enlace no aparezca en el menú no prueba nada.

Las migraciones se prueban en local **siempre**: un error de sintaxis en un `using()` puede dejar fuera al panel o, peor, abrir una tabla. Y como el despliegue del esquema y el de Vercel corren en paralelo al mergear, evita en la misma migración un cambio de esquema que rompa el código viejo — durante un minuto conviven.

**Datos de prueba**: prefijo `PRUEBA` y correos `@example.test`, siempre. No hay staging; todo lo que escribas aquí toca producción.

---

## 10. Estado de la implementación

### Hecho (fase 1)

| Archivo | Qué hace |
|---|---|
| `supabase/migrations/20260828170000_auth_perfiles_roles.sql` | `app_role`, `profiles`, `user_roles`, trigger de alta, hook de JWT, `is_admin()`, `is_active_user()` |
| `supabase/migrations/20260828170100_auth_policies_admin.sql` | Policies de admin sobre las cinco tablas + `admin_audit` |
| `supabase/config.toml` | Confirmación obligatoria, registro cerrado, contraseñas de 12, `max_frequency` 60 s, hook activado en local |
| `src/lib/supabase/server.ts` | Cliente con sesión (anon + cookies). Lo usa todo el panel |
| `src/lib/supabase/browser.ts` | Cliente de navegador, para el cierre de sesión |
| `src/lib/auth/dal.ts` | `getClaims()`, `requireUser()`, `requireAdmin()` |
| `src/lib/auth/redirect.ts` | `safeNext()` contra redirección abierta |
| `src/proxy.ts` | Refresco de sesión + chequeo optimista |
| `src/lib/actions/auth.ts` | `signIn` / `signOut` con mensajes genéricos |
| `src/app/login/` | Pantalla de acceso |
| `src/app/admin/` | Layout con gate, resumen y cinco listados |

Verificado con `tsc --noEmit`, `eslint` y `next build`. El build confirma dos cosas que importaban:

- `ƒ Proxy (Middleware)` — Next reconoce `proxy.ts`.
- `/tienda` sigue saliendo como `○ (Static)` con revalidación de 5 min. **El sitio público no perdió el prerender**, que era el riesgo de meter cookies en la aplicación.

### Desvío respecto al plan: el matcher del proxy

El plan decía correr el proxy en todas las rutas, que es la recomendación genérica de Supabase. Se implementó acotado a `/admin`, `/cuenta`, `/login` y `/auth`.

Motivo: este sitio es mayoritariamente estático y pagar una verificación de JWT en cada vista de producto no compra nada. Dentro del área privada el token se refresca en cada navegación; fuera lo mantiene vivo el cliente del navegador. Si algún día aparece contenido público que dependa de la sesión, hay que ampliarlo.

### Pendiente

**Antes de desplegar**
- [ ] Validar las migraciones (`supabase db start`, con Docker) o esperar al workflow del PR
- [ ] Producción: apagar el registro público, `enable_confirmations`, política de contraseñas y URL Configuration **en el dashboard** — `config.toml` es sólo local
- [ ] Activar el hook en `Authentication → Hooks`
- [ ] Crear las dos cuentas admin y promoverlas (§4.1, pasos 4 a 6)

**Fase 1, lo que falta de código** — nada. Completada en la segunda iteración:

| Archivo | Qué añade |
|---|---|
| `supabase/migrations/20260828170200_applications_status.sql` | CHECK con los cinco estados de una postulación |
| `src/lib/auth/audit.ts` | `logAdminAction()`, con service role: un admin no puede fabricar ni borrar trazas |
| `src/lib/actions/admin.ts` | Cambio de estado, marcar mensajes y firma de archivos |
| `src/lib/actions/mfa.ts` | `verificarMfa()` — reto TOTP en el servidor |
| `src/components/admin/` | Selector de estado, interruptor de mensajes, descarga firmada |
| `src/components/auth/MfaEnroll.tsx` | Alta del segundo factor, entera en el navegador |
| `src/components/auth/MfaChallengeForm.tsx` | Reto suelto para la sesión a medias |
| `src/components/auth/PanelLink.tsx` | Atajo al panel en el header, sólo para admins |
| `src/app/admin/seguridad/`, `src/app/login/mfa/` | Pantallas de MFA |

Cuatro decisiones que conviene conocer:

- **Las escrituras del panel van con el cliente autenticado**, no con service role. Las policies `admin actualiza postulaciones` y `admin marca mensajes` son las que autorizan; el `adminOrNull()` de las acciones sólo sirve para devolver un error legible en vez de un update que afecta a cero filas. Cero filas y fila inexistente se responden igual: no hay que decirle a nadie qué existe.
- **Los enlaces firmados se piden al pulsar, no al pintar la tabla.** Si se generaran al renderizar, cada carga del panel dejaría una tanda de URLs válidas en el HTML y la auditoría registraría una descarga por archivo aunque no se abriera ninguno. TTL de 60 s y `Content-Disposition: attachment`.
- **La autorización de la descarga es el orden de las operaciones**: primero se lee la fila con el cliente autenticado, así que si RLS no la entrega no se llega a firmar nada. La firma en sí necesita service role porque el bucket no tiene policies de storage.
- **MFA se exige, no se impone.** Si la cuenta tiene un factor verificado, `requireUser()` bloquea la sesión en aal1 y manda a `/login/mfa`. Si nunca se enroló, se entra igual y `/admin` muestra un aviso. Así nadie se queda fuera de golpe; hacerlo obligatorio es cambiar la condición de `mfaPendiente()`.

El QR y el secreto TOTP no pasan por nuestro servidor: van de Supabase al navegador y de ahí a la app de autenticación. Lo que no se registra no se filtra por un log.

**Fase 2 completa** — §5.
