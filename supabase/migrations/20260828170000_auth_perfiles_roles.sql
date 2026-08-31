-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — perfiles, roles y sesión
-- ─────────────────────────────────────────────────────────────
-- Base compartida por el panel admin y, más adelante, por las
-- cuentas de cliente. Las contraseñas y las sesiones las guarda
-- `auth.users`: aquí sólo van los datos que son nuestros.
--
-- El reparto es deliberado y es lo que sostiene la seguridad:
--   profiles   → datos personales, los edita su dueño
--   user_roles → autorización, NADIE la edita desde el navegador
--
-- Si `role` viviera en `profiles`, la policy de update que el
-- perfil necesita convertiría el rol en autoservicio: cualquiera
-- se haría admin desde la consola del navegador.

-- Roles de la aplicación ──────────────────────────────────────
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role' and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('cliente', 'admin');
  end if;
end
$$;

-- Datos personales ────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  nombre     text        not null default '',
  apellido   text        not null default '',
  telefono   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Autorización. El usuario no escribe aquí, ni lee: el rol le
-- llega dentro del JWT, puesto por el hook de más abajo.
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users on delete cascade,
  role       public.app_role not null default 'cliente',
  is_active  boolean         not null default true,
  created_at timestamptz     not null default now()
);

alter table public.profiles   enable row level security;
alter table public.user_roles enable row level security;

-- Alta automática al registrarse ──────────────────────────────
-- `search_path = ''` en toda función security definer: sin él,
-- quien pueda crear objetos coloca una función homónima en un
-- esquema que preceda en el search_path y su código acaba
-- ejecutándose con privilegios de superusuario.
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
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellido', '')
  );

  -- 'cliente' literal, nunca desde el input: `raw_user_meta_data`
  -- viene del formulario de registro y lo controla quien se apunta.
  insert into public.user_roles (user_id, role, is_active)
  values (new.id, 'cliente', true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- `updated_at` al día sin depender de que la app se acuerde.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Policies de `profiles` ──────────────────────────────────────
-- `(select auth.uid())` envuelto: Postgres lo evalúa una vez por
-- consulta en lugar de una vez por fila.
drop policy if exists "perfil propio: leer" on public.profiles;
create policy "perfil propio: leer"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- El `with check` es tan necesario como el `using`: sin él, un
-- update podría dejar la fila apuntando a otro usuario.
drop policy if exists "perfil propio: actualizar" on public.profiles;
create policy "perfil propio: actualizar"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sin policy de insert (lo hace el trigger) ni de delete: la baja
-- es lógica, con `user_roles.is_active`.

-- Cinturón y tirantes: aunque una policy futura dejara pasar un
-- update, estas columnas no existen para `authenticated`.
revoke update on public.profiles from authenticated;
grant  update (nombre, apellido, telefono) on public.profiles to authenticated;

-- El rol dentro del JWT ───────────────────────────────────────
-- Patrón oficial de Supabase para RBAC. Mete `user_role` e
-- `is_active` como claims al emitir el token, y así las policies
-- no consultan `user_roles` una vez por fila.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims   jsonb;
  v_role   public.app_role;
  v_active boolean;
begin
  select role, is_active
    into v_role, v_active
  from public.user_roles
  where user_id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  -- Sin fila en user_roles el usuario queda inactivo, no activo:
  -- denegar por defecto también aquí.
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

drop policy if exists "auth admin lee roles" on public.user_roles;
create policy "auth admin lee roles"
  on public.user_roles as permissive for select
  to supabase_auth_admin
  using (true);

-- Helpers para las policies ───────────────────────────────────
-- No son security definer a propósito: sólo leen el JWT de quien
-- llama, así que no necesitan privilegios elevados.
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
