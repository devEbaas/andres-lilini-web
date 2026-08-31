-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — cancelación de cuenta y derechos ARCO
-- ─────────────────────────────────────────────────────────────
-- Dos vías distintas a propósito:
--
--   A. Cancelación de cuenta — autoservicio, inmediata. Cubre lo que
--      está ligado a la sesión.
--   B. Solicitud ARCO — canal con cola, abierto también a quien nunca
--      tuvo cuenta. Cubre lo que entró por formularios públicos.
--
-- Meterlo todo en un botón produce o un borrado incompleto, o uno que
-- destroza una postulación en curso.

-- ── Registro de bajas ─────────────────────────────────────────
-- Hace falta poder demostrar cuándo se atendió una baja. Guardar el
-- correo de quien pidió que borraras su correo sería contradictorio,
-- así que sólo va el id (ya huérfano) y la fecha.
--
-- Sin FK a auth.users: la fila referenciada deja de existir.
create table if not exists public.account_deletions (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null,
  created_at timestamptz not null default now()
);

alter table public.account_deletions enable row level security;

drop policy if exists "admin lee bajas" on public.account_deletions;
create policy "admin lee bajas"
  on public.account_deletions for select
  to authenticated
  using ((select public.is_admin()));

-- ── Vía A: cancelación de cuenta ──────────────────────────────
-- Anonimiza los pedidos y deja constancia. El borrado de `auth.users`
-- lo hace después la aplicación con service role: esta función se
-- ejecuta mientras `auth.uid()` todavía vale.
--
-- Los pedidos NO se borran: hay obligación fiscal de conservarlos. Se
-- van el correo y la dirección; se quedan importes, fechas y estado,
-- que es lo que la contabilidad necesita y no identifica a nadie.
create or replace function public.cancelar_mi_cuenta()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid;
  v_email text;
  v_filas integer;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'sin sesión';
  end if;

  -- Sólo se anonimizan pedidos de invitado por correo si está
  -- confirmado, por el mismo motivo que en la vinculación: si no,
  -- bastaría registrarse con el correo de otro.
  select u.email
    into v_email
  from auth.users u
  where u.id = v_uid
    and u.email_confirmed_at is not null;

  update public.orders
  set email = null,
      shipping_address = null
  where user_id = v_uid
     or (
       v_email is not null
       and user_id is null
       and email is not null
       and lower(email) = lower(v_email)
     );

  get diagnostics v_filas = row_count;

  insert into public.account_deletions (user_id) values (v_uid);

  return v_filas;
end;
$$;

revoke execute on function public.cancelar_mi_cuenta() from anon, public;
grant  execute on function public.cancelar_mi_cuenta() to authenticated;

-- ── Vía B: solicitudes ARCO ───────────────────────────────────
-- El derecho es de cualquier titular, tenga cuenta o no, así que el
-- formulario es público y entra por service role igual que
-- `contact_messages`.
create table if not exists public.arco_requests (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('acceso', 'rectificacion', 'cancelacion', 'oposicion')),
  nombre      text not null default '',
  email       text not null,
  detalle     text not null default '',
  status      text not null default 'recibida'
              check (status in ('recibida', 'en_proceso', 'atendida', 'rechazada')),
  nota        text,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users on delete set null
);

create index if not exists arco_requests_created_at_idx
  on public.arco_requests (created_at desc);
create index if not exists arco_requests_email_idx
  on public.arco_requests (lower(email));

alter table public.arco_requests enable row level security;

-- Sin policy de insert: escribe la service role desde la Server Action.
drop policy if exists "admin lee solicitudes arco" on public.arco_requests;
create policy "admin lee solicitudes arco"
  on public.arco_requests for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admin resuelve solicitudes arco" on public.arco_requests;
create policy "admin resuelve solicitudes arco"
  on public.arco_requests for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
